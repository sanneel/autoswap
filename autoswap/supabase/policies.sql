-- =============================================================
-- AutoSwap — Row Level Security
-- Run AFTER schema.sql and functions.sql.
--
-- Guest reads rely on auth.uid() = null falling through to the "public?" branch.
-- System rows (offer_events, match_suggestions, notifications, conversations,
-- moderation flags) are written only by SECURITY DEFINER functions/triggers,
-- so they have no client INSERT policy.
-- =============================================================

alter table public.profiles                 enable row level security;
alter table public.vehicles                 enable row level security;
alter table public.vehicle_photos           enable row level security;
alter table public.swap_preferences         enable row level security;
alter table public.desired_vehicles         enable row level security;
alter table public.offers                   enable row level security;
alter table public.offer_events             enable row level security;
alter table public.saved_listings           enable row level security;
alter table public.match_suggestions        enable row level security;
alter table public.notifications            enable row level security;
alter table public.conversations            enable row level security;
alter table public.messages                 enable row level security;
alter table public.reports                  enable row level security;
alter table public.listing_moderation_flags enable row level security;
alter table public.listing_boosts_future    enable row level security;

-- ----------------------------- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- ----------------------------- vehicles
drop policy if exists vehicles_select_public on public.vehicles;
create policy vehicles_select_public on public.vehicles for select
  using (status = 'active' or owner_id = auth.uid());

drop policy if exists vehicles_insert_own on public.vehicles;
create policy vehicles_insert_own on public.vehicles for insert with check (owner_id = auth.uid());

drop policy if exists vehicles_update_own on public.vehicles;
create policy vehicles_update_own on public.vehicles for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
-- No client DELETE: deletion is a soft delete (status = 'deleted') via update.

-- ----------------------------- vehicle_photos
drop policy if exists vehicle_photos_select on public.vehicle_photos;
create policy vehicle_photos_select on public.vehicle_photos for select using (
  exists (select 1 from public.vehicles v
          where v.id = vehicle_id and (v.status = 'active' or v.owner_id = auth.uid()))
);

drop policy if exists vehicle_photos_insert_own on public.vehicle_photos;
create policy vehicle_photos_insert_own on public.vehicle_photos for insert with check (
  exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid())
);

drop policy if exists vehicle_photos_delete_own on public.vehicle_photos;
create policy vehicle_photos_delete_own on public.vehicle_photos for delete using (
  exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid())
);

-- ----------------------------- swap_preferences
drop policy if exists swap_preferences_select on public.swap_preferences;
create policy swap_preferences_select on public.swap_preferences for select using (
  exists (select 1 from public.vehicles v
          where v.id = vehicle_id and (v.status = 'active' or v.owner_id = auth.uid()))
);

drop policy if exists swap_preferences_write_own on public.swap_preferences;
create policy swap_preferences_write_own on public.swap_preferences for all
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()))
  with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));

-- ----------------------------- desired_vehicles
drop policy if exists desired_vehicles_select on public.desired_vehicles;
create policy desired_vehicles_select on public.desired_vehicles for select using (
  exists (select 1 from public.vehicles v
          where v.id = vehicle_id and (v.status = 'active' or v.owner_id = auth.uid()))
);

drop policy if exists desired_vehicles_write_own on public.desired_vehicles;
create policy desired_vehicles_write_own on public.desired_vehicles for all
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()))
  with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));

-- ----------------------------- offers
drop policy if exists offers_select_party on public.offers;
create policy offers_select_party on public.offers for select
  using (auth.uid() in (from_user_id, to_user_id));

drop policy if exists offers_insert_sender on public.offers;
create policy offers_insert_sender on public.offers for insert with check (
  from_user_id = auth.uid()
  and from_user_id <> to_user_id
  and exists (select 1 from public.vehicles v
              where v.id = offered_vehicle_id and v.owner_id = auth.uid() and v.status = 'active')
  and exists (select 1 from public.vehicles v
              where v.id = target_vehicle_id and v.owner_id = to_user_id and v.status = 'active')
);

-- Direct client updates may ONLY cancel your own outgoing open offer.
-- Accept/decline/counter/view run via SECURITY DEFINER RPCs (which bypass
-- RLS) — neither party must ever be able to flip a row to 'accepted' here.
drop policy if exists offers_update_party on public.offers;
drop policy if exists offers_cancel_sender on public.offers;
create policy offers_cancel_sender on public.offers for update
  using (from_user_id = auth.uid() and status in ('pending', 'viewed'))
  with check (from_user_id = auth.uid() and status = 'cancelled');

-- ----------------------------- offer_events (system-written)
drop policy if exists offer_events_select_party on public.offer_events;
create policy offer_events_select_party on public.offer_events for select using (
  exists (select 1 from public.offers o
          where o.id = offer_id and auth.uid() in (o.from_user_id, o.to_user_id))
);

-- ----------------------------- saved_listings
drop policy if exists saved_listings_select_own on public.saved_listings;
create policy saved_listings_select_own on public.saved_listings for select using (user_id = auth.uid());

drop policy if exists saved_listings_insert_own on public.saved_listings;
create policy saved_listings_insert_own on public.saved_listings for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.vehicles v where v.id = vehicle_id and v.status <> 'deleted')
);

drop policy if exists saved_listings_delete_own on public.saved_listings;
create policy saved_listings_delete_own on public.saved_listings for delete using (user_id = auth.uid());

-- ----------------------------- match_suggestions (system-written)
drop policy if exists match_select_party on public.match_suggestions;
create policy match_select_party on public.match_suggestions for select
  using (auth.uid() in (user_a_id, user_b_id));

drop policy if exists match_update_party on public.match_suggestions;
create policy match_update_party on public.match_suggestions for update
  using (auth.uid() in (user_a_id, user_b_id))
  with check (auth.uid() in (user_a_id, user_b_id));

-- ----------------------------- notifications (system-written)
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications for select using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------- conversations (created by accept_offer only)
drop policy if exists conversations_select_party on public.conversations;
create policy conversations_select_party on public.conversations for select
  using (auth.uid() in (user_a, user_b));

-- ----------------------------- messages
drop policy if exists messages_select_party on public.messages;
create policy messages_select_party on public.messages for select using (
  exists (select 1 from public.conversations c
          where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b))
);

drop policy if exists messages_insert_party on public.messages;
create policy messages_insert_party on public.messages for insert with check (
  sender_id = auth.uid()
  and exists (select 1 from public.conversations c
              where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b))
);

-- ----------------------------- reports
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports for insert with check (reporter_id = auth.uid());

drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports for select using (reporter_id = auth.uid());

-- ----------------------------- listing_moderation_flags (system-written)
-- Owners may read flags raised against their own listings.
drop policy if exists moderation_flags_select_owner on public.listing_moderation_flags;
create policy moderation_flags_select_owner on public.listing_moderation_flags for select using (
  exists (select 1 from public.vehicles v where v.id = vehicle_id and v.owner_id = auth.uid())
);

-- ----------------------------- listing_boosts_future
drop policy if exists listing_boosts_select on public.listing_boosts_future;
create policy listing_boosts_select on public.listing_boosts_future for select
  using (user_id = auth.uid() or boosted_until > now());
