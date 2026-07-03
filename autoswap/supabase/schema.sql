-- =============================================================
-- AutoSwap — Database schema (tables, indexes, core triggers, feed view)
-- Georgian car exchange marketplace · Supabase Postgres
--
-- Run order:
--   1. schema.sql     (this file)
--   2. functions.sql  (matching + offer RPCs + notification triggers)
--   3. policies.sql   (Row Level Security)
--   4. storage.sql    (vehicle-photos bucket + storage policies)
--   5. seed.sql       (local test data / mutual-match demo)
--
-- Cash model: a vehicle's swap terms live in swap_preferences
-- (cash_mode + positive cash_amount). Offers carry their own cash_mode/amount
-- from the SENDER's perspective. There is no signed cash column anywhere.
--
-- This file is idempotent: safe to re-run.
-- =============================================================

create extension if not exists "pgcrypto";

-- =============================================================
-- 1. profiles  (1:1 with auth.users)
-- =============================================================
create table if not exists public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  display_name             text,
  avatar_url               text,
  city                     text,
  phone                    text,
  phone_verified           boolean not null default false,
  email_verified           boolean not null default false,
  preferred_contact_method text check (preferred_contact_method in ('app', 'phone', 'whatsapp', 'email')),
  response_rate            numeric,
  last_active_at           timestamptz,
  completed_swaps_count    int not null default 0,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists profiles_display_name_idx
  on public.profiles (lower(coalesce(display_name, '')));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, phone, email_verified)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'AutoSwap user'
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.phone,
    new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- 2. vehicles  (listings)
-- =============================================================
create table if not exists public.vehicles (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,

  make         text not null,
  model        text not null,
  year         int  not null check (year between 1980 and 2100),
  mileage      int  not null check (mileage >= 0),

  fuel_type    text,
  transmission text,
  city         text,
  category     text,
  condition    text,
  description  text,

  estimated_value int,             -- owner's value estimate in GEL (filters/sorting)
  engine_size     numeric(3,1),    -- litres, e.g. 2.0
  power_hp        int,
  color           text,
  latitude        double precision,
  longitude       double precision,

  listing_type text not null default 'swap'
    check (listing_type in ('swap', 'sell', 'sell_or_swap')),

  status       text not null default 'active'
    check (status in ('draft', 'active', 'paused', 'archived', 'completed', 'deleted', 'under_review')),

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  paused_at    timestamptz,
  archived_at  timestamptz,

  -- Active listings must carry the required city + condition; drafts may omit.
  constraint vehicles_active_requirements
    check (status <> 'active' or (city is not null and condition is not null))
);

-- Additive upgrade for deployments created before the v2 listing fields.
alter table public.vehicles add column if not exists estimated_value int;
alter table public.vehicles add column if not exists engine_size     numeric(3,1);
alter table public.vehicles add column if not exists power_hp        int;
alter table public.vehicles add column if not exists color           text;
alter table public.vehicles add column if not exists latitude        double precision;
alter table public.vehicles add column if not exists longitude       double precision;

do $$ begin
  alter table public.vehicles add constraint vehicles_estimated_value_positive
    check (estimated_value is null or estimated_value > 0);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.vehicles add constraint vehicles_power_hp_positive
    check (power_hp is null or power_hp > 0);
exception when duplicate_object then null; end $$;

create index if not exists vehicles_owner_idx         on public.vehicles (owner_id);
create index if not exists vehicles_status_idx        on public.vehicles (status);
create index if not exists vehicles_make_model_idx    on public.vehicles (lower(make), lower(model));
create index if not exists vehicles_city_idx          on public.vehicles (lower(coalesce(city, '')));
create index if not exists vehicles_category_idx      on public.vehicles (lower(coalesce(category, '')));
create index if not exists vehicles_created_idx       on public.vehicles (created_at desc);
create index if not exists vehicles_active_created_idx on public.vehicles (created_at desc) where status = 'active';
create index if not exists vehicles_year_idx          on public.vehicles (year);
create index if not exists vehicles_mileage_idx       on public.vehicles (mileage);
create index if not exists vehicles_value_idx         on public.vehicles (estimated_value);
create index if not exists vehicles_fuel_idx          on public.vehicles (lower(coalesce(fuel_type, '')));
create index if not exists vehicles_transmission_idx  on public.vehicles (lower(coalesce(transmission, '')));

-- =============================================================
-- 3. vehicle_photos  (max 6 per vehicle, position 0 = cover)
--    Storage path: vehicles/{vehicle_id}/{photo_id}.jpg
-- =============================================================
create table if not exists public.vehicle_photos (
  id         uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  url        text not null,
  position   int  not null default 0 check (position between 0 and 5),
  created_at timestamptz not null default now(),
  unique (vehicle_id, position)
);

create index if not exists vehicle_photos_vehicle_idx on public.vehicle_photos (vehicle_id, position);

-- =============================================================
-- 4. swap_preferences  (1:1 with a vehicle — cash terms + notes)
-- =============================================================
create table if not exists public.swap_preferences (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null unique references public.vehicles(id) on delete cascade,
  cash_mode   text not null default 'none'
    check (cash_mode in ('add_money', 'ask_money', 'none', 'flexible')),
  cash_amount int  not null default 0 check (cash_amount >= 0),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists swap_preferences_vehicle_idx on public.swap_preferences (vehicle_id);

-- =============================================================
-- 5. desired_vehicles  ("I want that car")
--    label required; structured fields used for matching when present.
-- =============================================================
create table if not exists public.desired_vehicles (
  id              uuid primary key default gen_random_uuid(),
  vehicle_id      uuid not null references public.vehicles(id) on delete cascade,
  desired_make    text,
  desired_model   text,
  desired_category text,
  min_year        int,
  max_year        int,
  label           text not null,
  created_at      timestamptz not null default now(),
  constraint desired_year_range check (
    min_year is null or max_year is null or min_year <= max_year
  )
);

create index if not exists desired_vehicles_vehicle_idx on public.desired_vehicles (vehicle_id);
create index if not exists desired_vehicles_make_model_idx
  on public.desired_vehicles (lower(coalesce(desired_make, '')), lower(coalesce(desired_model, '')));
create index if not exists desired_vehicles_category_idx on public.desired_vehicles (lower(coalesce(desired_category, '')));
create index if not exists desired_vehicles_year_idx     on public.desired_vehicles (min_year, max_year);

-- =============================================================
-- 6. offers  (user-generated swap proposals; supports counters)
-- =============================================================
create table if not exists public.offers (
  id                 uuid primary key default gen_random_uuid(),

  target_vehicle_id  uuid not null references public.vehicles(id) on delete cascade,
  offered_vehicle_id uuid not null references public.vehicles(id) on delete cascade,

  from_user_id       uuid not null references public.profiles(id) on delete cascade,
  to_user_id         uuid not null references public.profiles(id) on delete cascade,

  -- From the SENDER's perspective.
  cash_mode          text not null default 'none'
    check (cash_mode in ('add_money', 'ask_money', 'none', 'flexible')),
  cash_amount        int not null default 0 check (cash_amount >= 0),

  message            text check (message is null or char_length(message) <= 500),

  status             text not null default 'pending'
    check (status in ('pending', 'viewed', 'accepted', 'declined', 'countered', 'cancelled', 'expired')),

  viewed_at          timestamptz,
  parent_offer_id    uuid references public.offers(id) on delete set null,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint offers_no_self_offer    check (from_user_id <> to_user_id),
  constraint offers_distinct_vehicle check (target_vehicle_id <> offered_vehicle_id)
);

create index if not exists offers_target_idx     on public.offers (target_vehicle_id);
create index if not exists offers_offered_idx    on public.offers (offered_vehicle_id);
create index if not exists offers_from_user_idx  on public.offers (from_user_id, created_at desc);
create index if not exists offers_to_user_idx    on public.offers (to_user_id, created_at desc);
create index if not exists offers_status_idx     on public.offers (status);
create index if not exists offers_parent_idx     on public.offers (parent_offer_id);

-- Prevent duplicate *pending* offers for the same (offered, target) pair.
create unique index if not exists offers_unique_pending_idx
  on public.offers (offered_vehicle_id, target_vehicle_id)
  where status = 'pending';

-- =============================================================
-- 7. offer_events  (negotiation history)
-- =============================================================
create table if not exists public.offer_events (
  id         uuid primary key default gen_random_uuid(),
  offer_id   uuid not null references public.offers(id) on delete cascade,
  actor_id   uuid references public.profiles(id) on delete set null,
  event_type text not null
    check (event_type in ('created', 'viewed', 'accepted', 'declined', 'countered', 'cancelled', 'expired')),
  message    text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists offer_events_offer_idx on public.offer_events (offer_id, created_at);

-- =============================================================
-- 8. saved_listings
-- =============================================================
create table if not exists public.saved_listings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, vehicle_id)
);

create index if not exists saved_listings_user_idx    on public.saved_listings (user_id, created_at desc);
create index if not exists saved_listings_vehicle_idx on public.saved_listings (vehicle_id);

-- =============================================================
-- 9. match_suggestions  (system-generated "you two may want to swap")
--    Pairs stored in canonical order vehicle_a_id < vehicle_b_id.
-- =============================================================
create table if not exists public.match_suggestions (
  id           uuid primary key default gen_random_uuid(),
  vehicle_a_id uuid not null references public.vehicles(id) on delete cascade,
  vehicle_b_id uuid not null references public.vehicles(id) on delete cascade,
  user_a_id    uuid not null references public.profiles(id) on delete cascade,
  user_b_id    uuid not null references public.profiles(id) on delete cascade,

  match_score  int  not null default 100,
  match_level  text not null default 'high'  check (match_level in ('high', 'medium', 'low')),
  match_type   text not null default 'mutual' check (match_type in ('mutual', 'reverse', 'partial', 'chain_future')),
  status       text not null default 'active'
    check (status in ('active', 'dismissed_by_a', 'dismissed_by_b', 'converted_to_offer', 'expired')),

  created_at   timestamptz not null default now(),

  constraint match_distinct_users   check (user_a_id <> user_b_id),
  constraint match_ordered_vehicles check (vehicle_a_id < vehicle_b_id),
  constraint match_unique_pair      unique (vehicle_a_id, vehicle_b_id)
);

create index if not exists match_user_a_idx    on public.match_suggestions (user_a_id);
create index if not exists match_user_b_idx    on public.match_suggestions (user_b_id);
create index if not exists match_vehicle_a_idx on public.match_suggestions (vehicle_a_id);
create index if not exists match_vehicle_b_idx on public.match_suggestions (vehicle_b_id);
create index if not exists match_status_idx    on public.match_suggestions (status);

-- =============================================================
-- 10. notifications
-- =============================================================
create table if not exists public.notifications (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  type                    text not null
    check (type in (
      'match_found', 'offer_received', 'offer_viewed', 'offer_accepted',
      'offer_declined', 'offer_countered', 'message_received',
      'listing_saved', 'listing_moderation', 'listing_boosted'
    )),
  title                   text not null,
  body                    text not null,
  related_vehicle_id      uuid references public.vehicles(id) on delete set null,
  related_offer_id        uuid references public.offers(id) on delete set null,
  related_match_id        uuid references public.match_suggestions(id) on delete set null,
  related_conversation_id uuid,
  read_at                 timestamptz,
  created_at              timestamptz not null default now()
);

create index if not exists notifications_user_idx   on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id) where read_at is null;

-- =============================================================
-- 11. conversations  (one accepted offer -> one conversation)
-- =============================================================
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  offer_id   uuid not null unique references public.offers(id) on delete cascade,
  user_a     uuid not null references public.profiles(id) on delete cascade,
  user_b     uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint conversation_distinct_users check (user_a <> user_b)
);

create index if not exists conversations_user_a_idx on public.conversations (user_a, created_at desc);
create index if not exists conversations_user_b_idx on public.conversations (user_b, created_at desc);

-- =============================================================
-- 12. messages
-- =============================================================
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null check (char_length(trim(body)) between 1 and 2000),
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- =============================================================
-- 13. reports
-- =============================================================
create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  vehicle_id       uuid references public.vehicles(id) on delete cascade,
  offer_id         uuid references public.offers(id) on delete cascade,
  message_id       uuid references public.messages(id) on delete cascade,
  reason           text not null
    check (reason in ('fake_listing', 'scam', 'spam', 'abuse', 'wrong_information', 'duplicate_listing', 'other')),
  details          text,
  created_at       timestamptz not null default now()
);

create index if not exists reports_reporter_idx on public.reports (reporter_id, created_at desc);
create index if not exists reports_vehicle_idx  on public.reports (vehicle_id);

-- =============================================================
-- 14. listing_moderation_flags
-- =============================================================
create table if not exists public.listing_moderation_flags (
  id          uuid primary key default gen_random_uuid(),
  vehicle_id  uuid not null references public.vehicles(id) on delete cascade,
  flag_type   text not null
    check (flag_type in ('duplicate_suspected', 'suspicious_photos', 'missing_photos', 'spam_content', 'reported_multiple_times')),
  severity    text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  details     jsonb,
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists moderation_flags_vehicle_idx on public.listing_moderation_flags (vehicle_id);
create index if not exists moderation_flags_open_idx     on public.listing_moderation_flags (vehicle_id) where resolved_at is null;

-- =============================================================
-- 15. listing_boosts_future  (future monetization — architecture only)
-- =============================================================
create table if not exists public.listing_boosts_future (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid references public.vehicles(id) on delete cascade,
  user_id       uuid references public.profiles(id) on delete cascade,
  amount        int,
  currency      text not null default 'GEL',
  status        text,
  boosted_until timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists listing_boosts_active_idx
  on public.listing_boosts_future (vehicle_id, boosted_until desc);

-- =============================================================
-- updated_at helper
-- =============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();

drop trigger if exists swap_preferences_set_updated_at on public.swap_preferences;
create trigger swap_preferences_set_updated_at before update on public.swap_preferences
  for each row execute function public.set_updated_at();

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at before update on public.offers
  for each row execute function public.set_updated_at();

-- =============================================================
-- public_vehicle_feed  (guest-readable feed)
--   security_invoker = false (definer): runs with the view owner's rights so
--   it can read owner trust aggregates from profiles even though callers can
--   no longer read other users' profile rows directly (profiles_select is now
--   own-row only). The WHERE clause restricts output to active listings, and
--   the select list is curated — the raw phone number never appears here.
--   Sort: boosted listings first (future), then newest active.
-- =============================================================
create or replace view public.public_vehicle_feed
with (security_invoker = false)
as
  select
    v.id,
    v.owner_id,
    v.make,
    v.model,
    v.year,
    v.mileage,
    v.fuel_type,
    v.transmission,
    v.city,
    v.category,
    v.condition,
    v.created_at,
    cover.url as cover_photo_url,
    coalesce(labels.desired_vehicle_labels, array[]::text[]) as desired_vehicle_labels,
    coalesce(sp.cash_mode, 'none') as cash_mode,
    coalesce(sp.cash_amount, 0)    as cash_amount,
    (boost.boosted_until is not null and boost.boosted_until > now()) as is_boosted,
    boost.boosted_until,
    -- Owner trust aggregates for the catalog trust strip (no raw PII —
    -- the phone itself never leaves profiles).
    p.display_name          as owner_name,
    p.phone_verified        as owner_phone_verified,
    p.completed_swaps_count as owner_completed_swaps,
    (p.last_active_at is not null and p.last_active_at > now() - interval '24 hours') as owner_active_today,
    -- v2 columns appended last: CREATE OR REPLACE VIEW only allows adding
    -- columns at the end of the select list.
    v.estimated_value,
    v.description
  from public.vehicles v
  left join public.profiles p on p.id = v.owner_id
  left join public.swap_preferences sp on sp.vehicle_id = v.id
  left join lateral (
    select p.url from public.vehicle_photos p
    where p.vehicle_id = v.id order by p.position asc limit 1
  ) cover on true
  left join lateral (
    select array_agg(d.label order by d.created_at) as desired_vehicle_labels
    from public.desired_vehicles d where d.vehicle_id = v.id
  ) labels on true
  left join lateral (
    select b.boosted_until from public.listing_boosts_future b
    where b.vehicle_id = v.id and b.boosted_until > now()
    order by b.boosted_until desc limit 1
  ) boost on true
  where v.status = 'active'
  order by
    (boost.boosted_until is not null and boost.boosted_until > now()) desc,
    boost.boosted_until desc nulls last,
    v.created_at desc;

grant select on public.public_vehicle_feed to anon, authenticated;

-- =============================================================
-- Realtime: stream messages, conversations and notifications.
-- =============================================================
do $$ begin alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;
