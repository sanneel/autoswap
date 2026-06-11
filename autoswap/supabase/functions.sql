-- =============================================================
-- AutoSwap — Server-side logic (Postgres functions + triggers)
-- Run AFTER schema.sql.
--
-- Contents:
--   * vehicle_matches_desire()            — does a vehicle satisfy a desire?
--   * find_mutual_matches_for_vehicle()   — create mutual match_suggestions
--   * run_matching_for_vehicle()          — RPC-friendly wrapper
--   * matching triggers (desires, swap_preferences, vehicle re-activation)
--   * accept_offer / decline_offer / counter_offer / mark_offer_viewed
--   * dismiss_match_suggestion()
--   * offer / message / saved-listing notification + event triggers
--
-- KEY PRODUCT RULE: a match_suggestion is SYSTEM-generated. It NEVER
-- auto-creates an offer. Offers are user-generated.
-- =============================================================

-- -------------------------------------------------------------
-- vehicle_matches_desire(vehicle_id, desired_vehicle_id) -> bool
--   * exact make match when desired_make present
--   * exact model match when desired_model present
--   * exact category match when desired_category present
--   * year within [min_year, max_year] when provided
--   * if no structured fields at all, fall back to label text matching
-- -------------------------------------------------------------
create or replace function public.vehicle_matches_desire(
  p_vehicle_id uuid,
  p_desired_vehicle_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when d.desired_make is null
       and d.desired_model is null
       and d.desired_category is null
       and d.min_year is null
       and d.max_year is null then
        -- Label-only desire: fall back to text matching on make / model.
        (d.label ilike '%' || v.make || '%') or (d.label ilike '%' || v.model || '%')
      else
        -- At least one of make / model / category must anchor the match.
        (d.desired_make is not null or d.desired_model is not null or d.desired_category is not null)
        and (d.desired_make is null     or lower(trim(v.make)) = lower(trim(d.desired_make)))
        and (d.desired_model is null    or lower(trim(v.model)) = lower(trim(d.desired_model)))
        and (d.desired_category is null or lower(trim(coalesce(v.category, ''))) = lower(trim(d.desired_category)))
        and (d.min_year is null or v.year >= d.min_year)
        and (d.max_year is null or v.year <= d.max_year)
    end
  from public.vehicles v, public.desired_vehicles d
  where v.id = p_vehicle_id and d.id = p_desired_vehicle_id;
$$;

grant execute on function public.vehicle_matches_desire(uuid, uuid) to authenticated, service_role;

-- -------------------------------------------------------------
-- find_mutual_matches_for_vehicle(vehicle_id) -> int (matches created)
-- -------------------------------------------------------------
create or replace function public.find_mutual_matches_for_vehicle(p_vehicle_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner   uuid;
  v_count   int := 0;
  rec       record;
  a_vehicle uuid;
  b_vehicle uuid;
  a_user    uuid;
  b_user    uuid;
  a_desc    text;
  b_desc    text;
  new_match uuid;
begin
  select owner_id into v_owner
  from public.vehicles
  where id = p_vehicle_id and status = 'active';

  if v_owner is null then
    return 0;
  end if;

  for rec in
    select w.id as w_id, w.owner_id as w_owner
    from public.vehicles w
    where w.status = 'active'
      and w.id <> p_vehicle_id
      and w.owner_id <> v_owner
      and exists (
        select 1 from public.desired_vehicles dv
        where dv.vehicle_id = p_vehicle_id and public.vehicle_matches_desire(w.id, dv.id)
      )
      and exists (
        select 1 from public.desired_vehicles dw
        where dw.vehicle_id = w.id and public.vehicle_matches_desire(p_vehicle_id, dw.id)
      )
  loop
    if p_vehicle_id < rec.w_id then
      a_vehicle := p_vehicle_id; a_user := v_owner;
      b_vehicle := rec.w_id;     b_user := rec.w_owner;
    else
      a_vehicle := rec.w_id;     a_user := rec.w_owner;
      b_vehicle := p_vehicle_id; b_user := v_owner;
    end if;

    insert into public.match_suggestions
      (vehicle_a_id, vehicle_b_id, user_a_id, user_b_id, match_score, match_level, match_type, status)
    values
      (a_vehicle, b_vehicle, a_user, b_user, 100, 'high', 'mutual', 'active')
    on conflict (vehicle_a_id, vehicle_b_id) do nothing
    returning id into new_match;

    if new_match is not null then
      v_count := v_count + 1;

      select make || ' ' || model into a_desc from public.vehicles where id = a_vehicle;
      select make || ' ' || model into b_desc from public.vehicles where id = b_vehicle;

      insert into public.notifications (user_id, type, title, body, related_vehicle_id, related_match_id)
      values (
        a_user, 'match_found', 'შესაძლო გაცვლა მოიძებნა',
        b_desc || ' ეძებს ' || a_desc || '-ს. შეგიძლია შეთავაზება გაუგზავნო.',
        b_vehicle, new_match
      );

      insert into public.notifications (user_id, type, title, body, related_vehicle_id, related_match_id)
      values (
        b_user, 'match_found', 'შესაძლო გაცვლა მოიძებნა',
        a_desc || ' ეძებს ' || b_desc || '-ს. შეგიძლია შეთავაზება გაუგზავნო.',
        a_vehicle, new_match
      );

      new_match := null;
    end if;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.find_mutual_matches_for_vehicle(uuid) to authenticated, service_role;

create or replace function public.run_matching_for_vehicle(p_vehicle_id uuid)
returns int
language sql
security definer
set search_path = public
as $$
  select public.find_mutual_matches_for_vehicle(p_vehicle_id);
$$;

grant execute on function public.run_matching_for_vehicle(uuid) to authenticated, service_role;

-- -------------------------------------------------------------
-- Matching triggers: desires (insert/update), swap_preferences
-- (insert/update), and vehicle re-activation.
-- -------------------------------------------------------------
create or replace function public.trg_match_on_desire()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.find_mutual_matches_for_vehicle(new.vehicle_id);
  return new;
end; $$;

drop trigger if exists match_on_desire_insert on public.desired_vehicles;
create trigger match_on_desire_insert after insert on public.desired_vehicles
  for each row execute function public.trg_match_on_desire();

drop trigger if exists match_on_desire_update on public.desired_vehicles;
create trigger match_on_desire_update after update on public.desired_vehicles
  for each row execute function public.trg_match_on_desire();

create or replace function public.trg_match_on_preferences()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.find_mutual_matches_for_vehicle(new.vehicle_id);
  return new;
end; $$;

drop trigger if exists match_on_preferences on public.swap_preferences;
create trigger match_on_preferences after insert or update on public.swap_preferences
  for each row execute function public.trg_match_on_preferences();

create or replace function public.trg_match_on_vehicle_activate()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'active' and coalesce(old.status, '') <> 'active' then
    perform public.find_mutual_matches_for_vehicle(new.id);
  end if;
  return new;
end; $$;

drop trigger if exists match_on_vehicle_activate on public.vehicles;
create trigger match_on_vehicle_activate after update of status on public.vehicles
  for each row execute function public.trg_match_on_vehicle_activate();

-- -------------------------------------------------------------
-- accept_offer(offer_id) -> conversation_id (atomic)
--   Accepting completes the swap:
--     * both vehicles row-locked in canonical id order so two competing
--       accepts serialize — the second one fails the active check
--     * both vehicles -> status 'completed'
--     * every other open offer touching either vehicle is auto-declined
--     * both owners' completed_swaps_count is bumped
-- -------------------------------------------------------------
create or replace function public.accept_offer(offer_id_input uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  o               public.offers%rowtype;
  conversation_id uuid;
  v_low           uuid;
  v_high          uuid;
  competing       record;
begin
  select * into o from public.offers where id = offer_id_input for update;
  if not found then raise exception 'Offer not found'; end if;
  if o.to_user_id <> auth.uid() then raise exception 'Only the receiver can accept this offer'; end if;
  if o.status not in ('pending', 'viewed', 'countered') then
    raise exception 'Offer is not in an acceptable state';
  end if;
  if not exists (select 1 from public.vehicles where id = o.target_vehicle_id and owner_id = auth.uid()) then
    raise exception 'Caller does not own the target vehicle';
  end if;

  perform 1
    from public.vehicles
   where id in (o.offered_vehicle_id, o.target_vehicle_id)
   order by id
     for update;

  if exists (select 1 from public.vehicles
              where id in (o.offered_vehicle_id, o.target_vehicle_id)
                and status <> 'active') then
    raise exception 'Both vehicles must still be active to complete a swap';
  end if;

  update public.offers set status = 'accepted' where id = o.id;

  insert into public.offer_events (offer_id, actor_id, event_type)
  values (o.id, auth.uid(), 'accepted');

  insert into public.conversations (offer_id, user_a, user_b)
  values (o.id, o.from_user_id, o.to_user_id)
  on conflict (offer_id) do update set offer_id = excluded.offer_id
  returning id into conversation_id;

  insert into public.notifications
    (user_id, type, title, body, related_offer_id, related_conversation_id, related_vehicle_id)
  values (
    o.from_user_id, 'offer_accepted', 'შენი შეთავაზება მიიღეს',
    'შენი შეთავაზება დადასტურდა. ჩატი უკვე ღიაა.',
    o.id, conversation_id, o.target_vehicle_id
  );

  -- The swap is agreed: both listings leave the market.
  update public.vehicles
     set status = 'completed'
   where id in (o.offered_vehicle_id, o.target_vehicle_id);

  update public.profiles
     set completed_swaps_count = completed_swaps_count + 1
   where id in (o.from_user_id, o.to_user_id);

  -- Auto-decline every other open offer involving either vehicle.
  for competing in
    select id, from_user_id, target_vehicle_id
      from public.offers
     where id <> o.id
       and status in ('pending', 'viewed', 'countered')
       and (target_vehicle_id  in (o.offered_vehicle_id, o.target_vehicle_id)
         or offered_vehicle_id in (o.offered_vehicle_id, o.target_vehicle_id))
       for update
  loop
    update public.offers set status = 'declined' where id = competing.id;
    insert into public.offer_events (offer_id, actor_id, event_type, message)
    values (competing.id, null, 'declined', 'auto-declined: vehicle was swapped in another offer');
    insert into public.notifications (user_id, type, title, body, related_offer_id, related_vehicle_id)
    values (competing.from_user_id, 'offer_declined', 'შეთავაზება აღარ არის აქტუალური',
            'ერთ-ერთი მანქანა უკვე გაიცვალა — შეთავაზება ავტომატურად დაიხურა.',
            competing.id, competing.target_vehicle_id);
  end loop;

  v_low  := least(o.offered_vehicle_id, o.target_vehicle_id);
  v_high := greatest(o.offered_vehicle_id, o.target_vehicle_id);
  update public.match_suggestions set status = 'converted_to_offer'
   where vehicle_a_id = v_low and vehicle_b_id = v_high and status = 'active';

  return conversation_id;
end;
$$;

grant execute on function public.accept_offer(uuid) to authenticated;

-- -------------------------------------------------------------
-- cancel_offer(offer_id) — sender withdraws a pending/viewed offer.
-- The 'cancelled' offer_event is logged by trg_offer_after_status.
-- -------------------------------------------------------------
create or replace function public.cancel_offer(offer_id_input uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare o public.offers%rowtype;
begin
  select * into o from public.offers where id = offer_id_input for update;
  if not found then raise exception 'Offer not found'; end if;
  if o.from_user_id <> auth.uid() then raise exception 'Only the sender can cancel this offer'; end if;
  if o.status not in ('pending', 'viewed') then
    raise exception 'Offer is not in a cancellable state';
  end if;

  update public.offers set status = 'cancelled' where id = o.id;
  return true;
end;
$$;

grant execute on function public.cancel_offer(uuid) to authenticated;

-- -------------------------------------------------------------
-- decline_offer(offer_id)
-- -------------------------------------------------------------
create or replace function public.decline_offer(offer_id_input uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare o public.offers%rowtype;
begin
  select * into o from public.offers where id = offer_id_input for update;
  if not found then raise exception 'Offer not found'; end if;
  if o.to_user_id <> auth.uid() then raise exception 'Only the receiver can decline this offer'; end if;
  if o.status not in ('pending', 'viewed', 'countered') then
    raise exception 'Offer is not in a declinable state';
  end if;

  update public.offers set status = 'declined' where id = o.id;
  insert into public.offer_events (offer_id, actor_id, event_type) values (o.id, auth.uid(), 'declined');
  insert into public.notifications (user_id, type, title, body, related_offer_id, related_vehicle_id)
  values (o.from_user_id, 'offer_declined', 'შეთავაზება უარყოფილია',
          'სამწუხაროდ, შენი შეთავაზება არ იქნა მიღებული.', o.id, o.target_vehicle_id);
  return true;
end;
$$;

grant execute on function public.decline_offer(uuid) to authenticated;

-- -------------------------------------------------------------
-- counter_offer(...) -> new offer id
--   The receiver of the original counters with reversed direction:
--     new target  = original.offered_vehicle (the original sender's car)
--     new offered = chosen owned vehicle (defaults to original target)
-- -------------------------------------------------------------
create or replace function public.counter_offer(
  p_original_offer_id uuid,
  p_offered_vehicle_id uuid,
  p_cash_mode text,
  p_cash_amount int,
  p_message text
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  o            public.offers%rowtype;
  new_offered  uuid;
  new_offer_id uuid;
begin
  select * into o from public.offers where id = p_original_offer_id for update;
  if not found then raise exception 'Original offer not found'; end if;
  if o.to_user_id <> auth.uid() then raise exception 'Only the receiver can counter this offer'; end if;
  if o.status not in ('pending', 'viewed') then raise exception 'Offer cannot be countered'; end if;

  new_offered := coalesce(p_offered_vehicle_id, o.target_vehicle_id);
  if not exists (select 1 from public.vehicles where id = new_offered and owner_id = auth.uid() and status = 'active') then
    raise exception 'Countering vehicle must be an active vehicle you own';
  end if;

  update public.offers set status = 'countered' where id = o.id;
  insert into public.offer_events (offer_id, actor_id, event_type) values (o.id, auth.uid(), 'countered');

  insert into public.offers
    (target_vehicle_id, offered_vehicle_id, from_user_id, to_user_id,
     cash_mode, cash_amount, message, status, parent_offer_id)
  values
    (o.offered_vehicle_id, new_offered, auth.uid(), o.from_user_id,
     coalesce(p_cash_mode, 'none'), coalesce(p_cash_amount, 0), p_message, 'pending', o.id)
  returning id into new_offer_id;

  -- Notify the original sender that they received a counter.
  insert into public.notifications (user_id, type, title, body, related_offer_id, related_vehicle_id)
  values (o.from_user_id, 'offer_countered', 'შემოგითავაზეს კონტრ-შეთავაზება',
          'შენს შეთავაზებაზე გამოგიგზავნეს კონტრ-შეთავაზება.', new_offer_id, o.offered_vehicle_id);

  return new_offer_id;
end;
$$;

grant execute on function public.counter_offer(uuid, uuid, text, int, text) to authenticated;

-- -------------------------------------------------------------
-- mark_offer_viewed(offer_id)
-- -------------------------------------------------------------
create or replace function public.mark_offer_viewed(offer_id_input uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare o public.offers%rowtype;
begin
  select * into o from public.offers where id = offer_id_input for update;
  if not found then raise exception 'Offer not found'; end if;
  if o.to_user_id <> auth.uid() then raise exception 'Only the receiver can mark this offer viewed'; end if;
  if o.status <> 'pending' then return false; end if;

  update public.offers set status = 'viewed', viewed_at = now() where id = o.id;
  insert into public.offer_events (offer_id, actor_id, event_type) values (o.id, auth.uid(), 'viewed');
  insert into public.notifications (user_id, type, title, body, related_offer_id, related_vehicle_id)
  values (o.from_user_id, 'offer_viewed', 'შენი შეთავაზება ნანახია',
          'მფლობელმა შენი შეთავაზება ნახა.', o.id, o.target_vehicle_id);
  return true;
end;
$$;

grant execute on function public.mark_offer_viewed(uuid) to authenticated;

-- -------------------------------------------------------------
-- dismiss_match_suggestion(match_id) — sets the correct dismissed_by side.
-- -------------------------------------------------------------
create or replace function public.dismiss_match_suggestion(p_match_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare m public.match_suggestions%rowtype;
begin
  select * into m from public.match_suggestions where id = p_match_id;
  if not found then raise exception 'Match not found'; end if;
  if auth.uid() not in (m.user_a_id, m.user_b_id) then raise exception 'Not your match'; end if;

  update public.match_suggestions
     set status = case when auth.uid() = m.user_a_id then 'dismissed_by_a' else 'dismissed_by_b' end
   where id = m.id;
  return true;
end;
$$;

grant execute on function public.dismiss_match_suggestion(uuid) to authenticated;

-- -------------------------------------------------------------
-- Offer triggers
--   INSERT  -> log 'created' event; notify receiver (only for fresh offers,
--              not counters — counter notifications are sent by counter_offer).
--   UPDATE  -> log 'cancelled' / 'expired' events (accept/decline/counter/view
--              are logged by their RPCs).
-- -------------------------------------------------------------
create or replace function public.trg_offer_after_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.offer_events (offer_id, actor_id, event_type)
  values (new.id, new.from_user_id, 'created');

  if new.parent_offer_id is null then
    insert into public.notifications (user_id, type, title, body, related_offer_id, related_vehicle_id)
    values (new.to_user_id, 'offer_received', 'ახალი შეთავაზება',
            'მომხმარებელმა შენს მანქანას გაცვლა შემოგთავაზა.', new.id, new.target_vehicle_id);
  end if;

  return new;
end; $$;

drop trigger if exists offers_after_insert on public.offers;
create trigger offers_after_insert after insert on public.offers
  for each row execute function public.trg_offer_after_insert();

create or replace function public.trg_offer_after_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status in ('pending', 'viewed') then
    insert into public.offer_events (offer_id, actor_id, event_type)
    values (new.id, new.from_user_id, 'cancelled');
  elsif new.status = 'expired' and old.status in ('pending', 'viewed') then
    insert into public.offer_events (offer_id, actor_id, event_type)
    values (new.id, null, 'expired');
  end if;
  return new;
end; $$;

drop trigger if exists offers_after_status on public.offers;
create trigger offers_after_status after update of status on public.offers
  for each row execute function public.trg_offer_after_status();

-- -------------------------------------------------------------
-- Message notifications: notify the other participant.
-- -------------------------------------------------------------
create or replace function public.trg_message_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  c            public.conversations%rowtype;
  recipient_id uuid;
begin
  select * into c from public.conversations where id = new.conversation_id;
  if not found then return new; end if;
  recipient_id := case when new.sender_id = c.user_a then c.user_b else c.user_a end;

  insert into public.notifications (user_id, type, title, body, related_conversation_id)
  values (recipient_id, 'message_received', 'ახალი შეტყობინება',
          'მიიღე ახალი მესიჯი გაცვლის ჩატში.', new.conversation_id);
  return new;
end; $$;

drop trigger if exists messages_notify on public.messages;
create trigger messages_notify after insert on public.messages
  for each row execute function public.trg_message_notifications();

-- -------------------------------------------------------------
-- Saved-listing notifications: notify the listing owner.
-- -------------------------------------------------------------
create or replace function public.trg_saved_listing_notify()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  select v.owner_id into owner_id from public.vehicles v where v.id = new.vehicle_id;
  if owner_id is not null and owner_id <> new.user_id then
    insert into public.notifications (user_id, type, title, body, related_vehicle_id)
    values (owner_id, 'listing_saved', 'შენი განცხადება შეინახეს',
            'ვიღაცამ შენი მანქანა ფავორიტებში დაამატა.', new.vehicle_id);
  end if;
  return new;
end; $$;

drop trigger if exists saved_listing_notify on public.saved_listings;
create trigger saved_listing_notify after insert on public.saved_listings
  for each row execute function public.trg_saved_listing_notify();
