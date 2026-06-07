-- =============================================================
-- AutoSwap Web MVP schema
-- Run in Supabase SQL editor before policies.sql.
-- Stack: Next.js + Supabase Auth + Postgres + Storage + Realtime.
-- =============================================================

create extension if not exists "pgcrypto";

-- ----------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create index if not exists profiles_display_name_idx on public.profiles (lower(coalesce(display_name, '')));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, phone, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1),
      'AutoSwap user'
    ),
    new.phone,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------- vehicles
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,

  make text not null,
  model text not null,
  year int not null check (year between 1900 and 2100),
  mileage int not null check (mileage >= 0),

  fuel_type text,
  transmission text,
  location text,
  description text,

  listing_type text not null default 'swap'
    check (listing_type in ('swap', 'sell', 'sell_or_swap')),

  cash_adjustment int not null default 0,
  -- positive = owner wants money
  -- negative = owner will add money
  -- zero = straight swap

  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'deleted')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicles_owner_idx on public.vehicles (owner_id);
create index if not exists vehicles_active_created_idx on public.vehicles (created_at desc) where status = 'active';
create index if not exists vehicles_search_idx on public.vehicles (lower(make), lower(model), lower(coalesce(location, '')));

-- ----------------------------- vehicle_photos
create table if not exists public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  url text not null,
  position int not null default 0 check (position between 0 and 5),
  created_at timestamptz not null default now(),
  unique (vehicle_id, position)
);

create index if not exists vehicle_photos_vehicle_idx on public.vehicle_photos (vehicle_id, position);

-- ----------------------------- desired_vehicles
create table if not exists public.desired_vehicles (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  desired_make text,
  desired_model text,
  desired_category text,
  created_at timestamptz not null default now()
);

create index if not exists desired_vehicles_vehicle_idx on public.desired_vehicles (vehicle_id);
create index if not exists desired_vehicles_lookup_idx
  on public.desired_vehicles (lower(coalesce(desired_make, '')), lower(coalesce(desired_model, '')), lower(coalesce(desired_category, '')));

-- ----------------------------- offers
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),

  target_vehicle_id uuid not null,
  offered_vehicle_id uuid not null,

  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,

  cash_adjustment int not null default 0,
  -- positive = offer sender adds money
  -- negative = offer sender wants money
  -- zero = straight swap

  message text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled', 'expired')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint offers_target_vehicle_id_fkey
    foreign key (target_vehicle_id) references public.vehicles(id) on delete cascade,
  constraint offers_offered_vehicle_id_fkey
    foreign key (offered_vehicle_id) references public.vehicles(id) on delete cascade,
  constraint no_self_offer check (from_user_id <> to_user_id),
  constraint no_same_vehicle_offer check (target_vehicle_id <> offered_vehicle_id)
);

create index if not exists offers_from_user_idx on public.offers (from_user_id, created_at desc);
create index if not exists offers_to_user_idx on public.offers (to_user_id, created_at desc);
create index if not exists offers_target_pending_idx on public.offers (target_vehicle_id) where status = 'pending';

-- ----------------------------- conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique references public.offers(id) on delete cascade,
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint conversation_users_distinct check (user_a <> user_b)
);

create index if not exists conversations_user_a_idx on public.conversations (user_a, created_at desc);
create index if not exists conversations_user_b_idx on public.conversations (user_b, created_at desc);

-- ----------------------------- messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at);

-- ----------------------------- future admin and monetization
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete cascade,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.listing_boosts (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  amount int,
  currency text not null default 'GEL',
  status text,
  boosted_until timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------- helper triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

-- ----------------------------- backend function: accept offer
create or replace function public.accept_offer(offer_id_input uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_offer public.offers%rowtype;
  conversation_id uuid;
begin
  select *
    into selected_offer
    from public.offers
   where id = offer_id_input
   for update;

  if not found then
    raise exception 'Offer not found';
  end if;

  if selected_offer.status <> 'pending' then
    raise exception 'Only pending offers can be accepted';
  end if;

  if selected_offer.to_user_id <> auth.uid() then
    raise exception 'Only the listing owner can accept this offer';
  end if;

  if not exists (
    select 1
      from public.vehicles
     where id = selected_offer.target_vehicle_id
       and owner_id = auth.uid()
  ) then
    raise exception 'Current user does not own target vehicle';
  end if;

  update public.offers
     set status = 'accepted'
   where id = selected_offer.id;

  update public.offers
     set status = 'rejected'
   where target_vehicle_id = selected_offer.target_vehicle_id
     and status = 'pending'
     and id <> selected_offer.id;

  insert into public.conversations (offer_id, user_a, user_b)
  values (selected_offer.id, selected_offer.from_user_id, selected_offer.to_user_id)
  on conflict (offer_id) do update
    set offer_id = excluded.offer_id
  returning id into conversation_id;

  return conversation_id;
end;
$$;

grant execute on function public.accept_offer(uuid) to authenticated;

-- ----------------------------- realtime publication
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then
  null;
end $$;
