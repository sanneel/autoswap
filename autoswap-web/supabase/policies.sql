-- =============================================================
-- AutoSwap Web MVP RLS and Storage policies
-- Run after schema.sql.
-- =============================================================

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.desired_vehicles enable row level security;
alter table public.offers enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.listing_boosts enable row level security;

-- ----------------------------- profiles
drop policy if exists "profiles are visible" on public.profiles;
create policy "profiles are visible"
on public.profiles for select
using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- ----------------------------- vehicles
drop policy if exists "public can view active vehicles" on public.vehicles;
create policy "public can view active vehicles"
on public.vehicles for select
using (status = 'active' or owner_id = auth.uid());

drop policy if exists "users create own vehicles" on public.vehicles;
create policy "users create own vehicles"
on public.vehicles for insert
with check (owner_id = auth.uid());

drop policy if exists "users update own vehicles" on public.vehicles;
create policy "users update own vehicles"
on public.vehicles for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "users delete own vehicles" on public.vehicles;
create policy "users delete own vehicles"
on public.vehicles for delete
using (owner_id = auth.uid());

-- ----------------------------- vehicle_photos
drop policy if exists "public can view active vehicle photos" on public.vehicle_photos;
create policy "public can view active vehicle photos"
on public.vehicle_photos for select
using (
  exists (
    select 1 from public.vehicles v
    where v.id = vehicle_photos.vehicle_id
      and (v.status = 'active' or v.owner_id = auth.uid())
  )
);

drop policy if exists "owners manage vehicle photos" on public.vehicle_photos;
create policy "owners manage vehicle photos"
on public.vehicle_photos for all
using (
  exists (
    select 1 from public.vehicles v
    where v.id = vehicle_photos.vehicle_id
      and v.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.vehicles v
    where v.id = vehicle_photos.vehicle_id
      and v.owner_id = auth.uid()
  )
);

-- ----------------------------- desired_vehicles
drop policy if exists "public can view desired vehicles" on public.desired_vehicles;
create policy "public can view desired vehicles"
on public.desired_vehicles for select
using (
  exists (
    select 1 from public.vehicles v
    where v.id = desired_vehicles.vehicle_id
      and (v.status = 'active' or v.owner_id = auth.uid())
  )
);

drop policy if exists "owners manage desired vehicles" on public.desired_vehicles;
create policy "owners manage desired vehicles"
on public.desired_vehicles for all
using (
  exists (
    select 1 from public.vehicles v
    where v.id = desired_vehicles.vehicle_id
      and v.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.vehicles v
    where v.id = desired_vehicles.vehicle_id
      and v.owner_id = auth.uid()
  )
);

-- ----------------------------- offers
drop policy if exists "users view related offers" on public.offers;
create policy "users view related offers"
on public.offers for select
using (from_user_id = auth.uid() or to_user_id = auth.uid());

drop policy if exists "users create valid offers" on public.offers;
create policy "users create valid offers"
on public.offers for insert
with check (
  from_user_id = auth.uid()
  and from_user_id <> to_user_id
  and exists (
    select 1 from public.vehicles offered
    where offered.id = offered_vehicle_id
      and offered.owner_id = auth.uid()
      and offered.status = 'active'
  )
  and exists (
    select 1 from public.vehicles target
    where target.id = target_vehicle_id
      and target.owner_id = to_user_id
      and target.status = 'active'
  )
);

drop policy if exists "sender cancels pending offers" on public.offers;
create policy "sender cancels pending offers"
on public.offers for update
using (from_user_id = auth.uid() and status = 'pending')
with check (from_user_id = auth.uid() and status = 'cancelled');

drop policy if exists "receiver updates pending offers" on public.offers;
create policy "receiver updates pending offers"
on public.offers for update
using (to_user_id = auth.uid() and status = 'pending')
with check (to_user_id = auth.uid() and status in ('accepted', 'rejected'));

-- ----------------------------- conversations
drop policy if exists "participants view conversations" on public.conversations;
create policy "participants view conversations"
on public.conversations for select
using (auth.uid() in (user_a, user_b));

-- Insert is handled by public.accept_offer().

-- ----------------------------- messages
drop policy if exists "participants view messages" on public.messages;
create policy "participants view messages"
on public.messages for select
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and auth.uid() in (c.user_a, c.user_b)
  )
);

drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages"
on public.messages for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and auth.uid() in (c.user_a, c.user_b)
  )
);

drop policy if exists "participants update message read state" on public.messages;
create policy "participants update message read state"
on public.messages for update
using (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and auth.uid() in (c.user_a, c.user_b)
  )
)
with check (
  exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and auth.uid() in (c.user_a, c.user_b)
  )
);

-- ----------------------------- reports
drop policy if exists "users create own reports" on public.reports;
create policy "users create own reports"
on public.reports for insert
with check (reporter_id = auth.uid());

drop policy if exists "users view own reports" on public.reports;
create policy "users view own reports"
on public.reports for select
using (reporter_id = auth.uid());

-- ----------------------------- listing boosts
drop policy if exists "public can view active listing boosts" on public.listing_boosts;
create policy "public can view active listing boosts"
on public.listing_boosts for select
using (boosted_until is not null and boosted_until > now());

-- Client writes for boosts should be added with Stripe webhooks later.

-- ----------------------------- storage
insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

create or replace function public.storage_vehicle_id(object_name text)
returns uuid
language plpgsql
immutable
as $$
declare
  vehicle_id uuid;
begin
  vehicle_id := (storage.foldername(object_name))[2]::uuid;
  return vehicle_id;
exception when others then
  return null;
end;
$$;

drop policy if exists "vehicle photos are public" on storage.objects;
create policy "vehicle photos are public"
on storage.objects for select
using (bucket_id = 'vehicle-photos');

drop policy if exists "owners upload vehicle photos" on storage.objects;
create policy "owners upload vehicle photos"
on storage.objects for insert
with check (
  bucket_id = 'vehicle-photos'
  and (storage.foldername(name))[1] = 'vehicles'
  and exists (
    select 1 from public.vehicles v
    where v.id = public.storage_vehicle_id(name)
      and v.owner_id = auth.uid()
  )
);

drop policy if exists "owners update vehicle photos" on storage.objects;
create policy "owners update vehicle photos"
on storage.objects for update
using (
  bucket_id = 'vehicle-photos'
  and exists (
    select 1 from public.vehicles v
    where v.id = public.storage_vehicle_id(name)
      and v.owner_id = auth.uid()
  )
)
with check (
  bucket_id = 'vehicle-photos'
  and exists (
    select 1 from public.vehicles v
    where v.id = public.storage_vehicle_id(name)
      and v.owner_id = auth.uid()
  )
);

drop policy if exists "owners delete vehicle photos" on storage.objects;
create policy "owners delete vehicle photos"
on storage.objects for delete
using (
  bucket_id = 'vehicle-photos'
  and exists (
    select 1 from public.vehicles v
    where v.id = public.storage_vehicle_id(name)
      and v.owner_id = auth.uid()
  )
);
