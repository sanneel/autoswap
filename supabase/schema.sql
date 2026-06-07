-- =============================================================
-- SwapRide schema
-- Run in the Supabase SQL editor in order: schema.sql -> policies.sql -> seed.sql
-- =============================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ----------------------------- enums
do $$ begin
  create type fuel_type as enum ('petrol','diesel','hybrid','electric','lpg','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transmission_type as enum ('manual','automatic','semi_automatic','cvt');
exception when duplicate_object then null; end $$;

do $$ begin
  create type money_adjustment as enum ('wants_money','adds_money','none');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vehicle_category as enum (
    'any','sedan','hatchback','suv','coupe','convertible','wagon','pickup','van','electric','hybrid','luxury'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type match_status as enum ('active','archived','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_reason as enum ('spam','fake_vehicle','scam','abuse','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open','reviewing','resolved','dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type swipe_action as enum ('interested','not_interested');
exception when duplicate_object then null; end $$;

-- ----------------------------- profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  city text,
  country text,
  phone text,
  bio text,
  contact_unlocked boolean not null default false,
  push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_full_name on public.profiles (lower(full_name));

-- ----------------------------- cars
create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  make text not null,
  model text not null,
  year int not null check (year between 1900 and extract(year from now())::int + 1),
  mileage_km int not null check (mileage_km >= 0),
  fuel_type fuel_type not null,
  transmission transmission_type not null,
  engine_size_l numeric(3,1) not null check (engine_size_l >= 0),
  color text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cars_owner on public.cars (owner_id);
create index if not exists idx_cars_active on public.cars (is_active) where is_active;
create index if not exists idx_cars_make_model on public.cars (lower(make), lower(model));

-- ----------------------------- car_photos
create table if not exists public.car_photos (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  storage_path text not null,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (car_id, position)
);

create index if not exists idx_car_photos_car on public.car_photos (car_id);

-- Enforce max 10 photos per car
create or replace function public.enforce_max_photos() returns trigger
language plpgsql as $$
declare cnt int;
begin
  select count(*) into cnt from public.car_photos where car_id = new.car_id;
  if cnt >= 10 then
    raise exception 'Max 10 photos per car';
  end if;
  return new;
end $$;

drop trigger if exists trg_enforce_max_photos on public.car_photos;
create trigger trg_enforce_max_photos
  before insert on public.car_photos
  for each row execute function public.enforce_max_photos();

-- ----------------------------- vehicle_preferences (per car: money side)
create table if not exists public.vehicle_preferences (
  car_id uuid primary key references public.cars(id) on delete cascade,
  money_adjustment money_adjustment not null default 'none',
  money_amount numeric(12,2) check (money_amount is null or money_amount >= 0),
  currency text default 'EUR',
  updated_at timestamptz not null default now()
);

-- ----------------------------- desired_vehicles (what owner wants in exchange)
create table if not exists public.desired_vehicles (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  make text,
  model text,
  year_min int check (year_min is null or year_min between 1900 and 2100),
  year_max int check (year_max is null or year_max between 1900 and 2100),
  category vehicle_category not null default 'any',
  created_at timestamptz not null default now()
);

create index if not exists idx_desired_car on public.desired_vehicles (car_id);
create index if not exists idx_desired_lookup on public.desired_vehicles (lower(coalesce(make,'')), lower(coalesce(model,'')), category);

-- ----------------------------- swipes (interested / not_interested)
create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  swiper_car_id uuid references public.cars(id) on delete set null,
  action swipe_action not null,
  created_at timestamptz not null default now(),
  unique (swiper_id, car_id)
);

create index if not exists idx_swipes_swiper on public.swipes (swiper_id);
create index if not exists idx_swipes_car on public.swipes (car_id);

-- ----------------------------- matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  car_a uuid not null references public.cars(id) on delete cascade,
  car_b uuid not null references public.cars(id) on delete cascade,
  status match_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Canonicalize: user_a is the lexicographically smaller uuid so we never duplicate.
  constraint matches_user_order check (user_a < user_b),
  unique (user_a, user_b, car_a, car_b)
);

create index if not exists idx_matches_user_a on public.matches (user_a);
create index if not exists idx_matches_user_b on public.matches (user_b);

-- ----------------------------- messages (chat)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_match on public.messages (match_id, created_at desc);

-- ----------------------------- reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reported_car_id uuid references public.cars(id) on delete set null,
  reason report_reason not null,
  details text,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_status on public.reports (status);

-- ----------------------------- payments (RevenueCat -> webhook -> here)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'revenuecat',
  product_id text not null,
  entitlement_id text not null,
  amount_cents int,
  currency text,
  purchased_at timestamptz not null default now(),
  raw jsonb
);

create index if not exists idx_payments_user on public.payments (user_id);

-- ----------------------------- updated_at trigger helpers
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_cars_updated on public.cars;
create trigger trg_cars_updated before update on public.cars
for each row execute function public.set_updated_at();

drop trigger if exists trg_matches_updated on public.matches;
create trigger trg_matches_updated before update on public.matches
for each row execute function public.set_updated_at();

-- ----------------------------- matching engine
-- Returns true if `desired` (a row in desired_vehicles) accepts `car`.
create or replace function public.desired_matches_car(
  d public.desired_vehicles,
  c public.cars
) returns boolean
language sql immutable as $$
  select
    (d.make is null or lower(d.make) = lower(c.make))
    and (d.model is null or lower(d.model) = lower(c.model))
    and (d.year_min is null or c.year >= d.year_min)
    and (d.year_max is null or c.year <= d.year_max)
    and (
      d.category = 'any'
      or (d.category = 'electric' and c.fuel_type = 'electric')
      or (d.category = 'hybrid'   and c.fuel_type = 'hybrid')
      -- category bucketing is loose; richer logic can be added later.
      or (d.category not in ('electric','hybrid'))
    )
$$;

-- Check if any of user_a's cars match a desire of user_b (and vice versa).
-- Inserts matches in canonical order; idempotent thanks to unique constraint.
create or replace function public.try_create_matches_for_pair(
  uid_a uuid, uid_b uuid
) returns int
language plpgsql security definer as $$
declare
  inserted int := 0;
  ca record;
  cb record;
begin
  if uid_a = uid_b then return 0; end if;

  for ca in
    select c.* from public.cars c where c.owner_id = uid_a and c.is_active
  loop
    for cb in
      select c.* from public.cars c where c.owner_id = uid_b and c.is_active
    loop
      -- B wants something like ca?
      if exists (
        select 1 from public.desired_vehicles d
        where d.car_id = cb.id and public.desired_matches_car(d, ca)
      )
      -- A wants something like cb?
      and exists (
        select 1 from public.desired_vehicles d
        where d.car_id = ca.id and public.desired_matches_car(d, cb)
      ) then
        insert into public.matches (user_a, user_b, car_a, car_b)
        values (
          least(uid_a, uid_b),
          greatest(uid_a, uid_b),
          case when uid_a < uid_b then ca.id else cb.id end,
          case when uid_a < uid_b then cb.id else ca.id end
        )
        on conflict do nothing;
        inserted := inserted + 1;
      end if;
    end loop;
  end loop;

  return inserted;
end $$;

-- After an "interested" swipe, see if there's a reciprocal swipe and create matches.
create or replace function public.handle_swipe() returns trigger
language plpgsql security definer as $$
declare
  car_owner uuid;
begin
  if new.action <> 'interested' then return new; end if;

  select owner_id into car_owner from public.cars where id = new.car_id;
  if car_owner is null or car_owner = new.swiper_id then return new; end if;

  -- Did the car_owner ever express "interested" in any of new.swiper_id's cars?
  if exists (
    select 1
    from public.swipes s
    join public.cars c on c.id = s.car_id
    where s.swiper_id = car_owner
      and s.action = 'interested'
      and c.owner_id = new.swiper_id
  ) then
    perform public.try_create_matches_for_pair(new.swiper_id, car_owner);
  end if;

  return new;
end $$;

drop trigger if exists trg_handle_swipe on public.swipes;
create trigger trg_handle_swipe
  after insert on public.swipes
  for each row execute function public.handle_swipe();

-- ----------------------------- realtime publication
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;
