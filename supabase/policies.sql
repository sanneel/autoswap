-- =============================================================
-- SwapRide Row Level Security policies
-- Run AFTER schema.sql
-- =============================================================

-- Enable RLS
alter table public.profiles            enable row level security;
alter table public.cars                enable row level security;
alter table public.car_photos          enable row level security;
alter table public.vehicle_preferences enable row level security;
alter table public.desired_vehicles    enable row level security;
alter table public.swipes              enable row level security;
alter table public.matches             enable row level security;
alter table public.messages            enable row level security;
alter table public.reports             enable row level security;
alter table public.payments            enable row level security;

-- ----------------------------- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (true); -- public discovery

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ----------------------------- cars
drop policy if exists cars_select on public.cars;
create policy cars_select on public.cars
  for select using (true);

drop policy if exists cars_modify on public.cars;
create policy cars_modify on public.cars
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ----------------------------- car_photos
drop policy if exists photos_select on public.car_photos;
create policy photos_select on public.car_photos
  for select using (true);

drop policy if exists photos_modify on public.car_photos;
create policy photos_modify on public.car_photos
  for all using (
    exists (select 1 from public.cars c where c.id = car_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.cars c where c.id = car_id and c.owner_id = auth.uid())
  );

-- ----------------------------- vehicle_preferences
drop policy if exists prefs_select on public.vehicle_preferences;
create policy prefs_select on public.vehicle_preferences for select using (true);

drop policy if exists prefs_modify on public.vehicle_preferences;
create policy prefs_modify on public.vehicle_preferences
  for all using (
    exists (select 1 from public.cars c where c.id = car_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.cars c where c.id = car_id and c.owner_id = auth.uid())
  );

-- ----------------------------- desired_vehicles
drop policy if exists desired_select on public.desired_vehicles;
create policy desired_select on public.desired_vehicles for select using (true);

drop policy if exists desired_modify on public.desired_vehicles;
create policy desired_modify on public.desired_vehicles
  for all using (
    exists (select 1 from public.cars c where c.id = car_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.cars c where c.id = car_id and c.owner_id = auth.uid())
  );

-- ----------------------------- swipes (private to the swiper)
drop policy if exists swipes_owner_select on public.swipes;
create policy swipes_owner_select on public.swipes
  for select using (swiper_id = auth.uid());

drop policy if exists swipes_owner_insert on public.swipes;
create policy swipes_owner_insert on public.swipes
  for insert with check (swiper_id = auth.uid());

drop policy if exists swipes_owner_delete on public.swipes;
create policy swipes_owner_delete on public.swipes
  for delete using (swiper_id = auth.uid());

-- ----------------------------- matches (only the two parties)
drop policy if exists matches_select on public.matches;
create policy matches_select on public.matches
  for select using (auth.uid() in (user_a, user_b));

drop policy if exists matches_update on public.matches;
create policy matches_update on public.matches
  for update using (auth.uid() in (user_a, user_b)) with check (auth.uid() in (user_a, user_b));

-- Insertion is handled by trigger via security definer fn; no INSERT policy needed.

-- ----------------------------- messages
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (
    exists (select 1 from public.matches m
            where m.id = match_id and auth.uid() in (m.user_a, m.user_b))
  );

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.matches m
                where m.id = match_id
                  and auth.uid() in (m.user_a, m.user_b)
                  and m.status = 'active')
  );

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update using (
    exists (select 1 from public.matches m
            where m.id = match_id and auth.uid() in (m.user_a, m.user_b))
  ) with check (
    exists (select 1 from public.matches m
            where m.id = match_id and auth.uid() in (m.user_a, m.user_b))
  );

-- ----------------------------- reports
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports
  for insert with check (reporter_id = auth.uid());

drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports
  for select using (reporter_id = auth.uid());

-- ----------------------------- payments (read-only from client; webhook writes via service role)
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select using (user_id = auth.uid());

-- =============================================================
-- Storage policies
-- Buckets: 'avatars' (public), 'car-photos' (public)
-- =============================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('car-photos', 'car-photos', true)
on conflict (id) do nothing;

drop policy if exists "avatars read" on storage.objects;
create policy "avatars read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars write own" on storage.objects;
create policy "avatars write own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "car photos read" on storage.objects;
create policy "car photos read" on storage.objects
  for select using (bucket_id = 'car-photos');

drop policy if exists "car photos write own" on storage.objects;
create policy "car photos write own" on storage.objects
  for insert with check (
    bucket_id = 'car-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "car photos update own" on storage.objects;
create policy "car photos update own" on storage.objects
  for update using (
    bucket_id = 'car-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "car photos delete own" on storage.objects;
create policy "car photos delete own" on storage.objects
  for delete using (
    bucket_id = 'car-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );
