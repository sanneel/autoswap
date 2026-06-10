-- =============================================================
-- AutoSwap — Seed / mutual-match test scenario  (LOCAL DEV ONLY)
-- Run AFTER schema.sql, functions.sql, policies.sql, storage.sql.
--
-- Canonical test:
--   User A: Audi A7 2020 (50,000 km, Tbilisi)  wants  BMW 550i 2018
--   User B: BMW 550i 2018 (70,000 km, Tbilisi) wants  Audi A7 2020
--   => exactly ONE match_suggestion, TWO match_found notifications, ZERO offers.
--
-- User C owns six extra listings to populate the feed.
-- Re-runnable: seed vehicles + their match notifications are reset each run.
-- =============================================================

-- ids:  A=aaaa…  B=bbbb…  C=cccc…
delete from public.notifications
  where type = 'match_found'
    and user_id in (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

delete from public.vehicles where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888');

-- Auth users (handle_new_user trigger auto-creates their profiles).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'authenticated', 'authenticated', 'user-a@autoswap.test', crypt('password123', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"User A"}', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'authenticated', 'authenticated', 'user-b@autoswap.test', crypt('password123', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"User B"}', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'authenticated', 'authenticated', 'user-c@autoswap.test', crypt('password123', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"User C"}', '', '', '', '')
on conflict (id) do nothing;

insert into public.profiles (id, display_name, city)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'User A', 'თბილისი'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'User B', 'თბილისი'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'User C', 'ბათუმი')
on conflict (id) do update set display_name = excluded.display_name, city = excluded.city;

-- Vehicles (active listings require city + condition).
-- created_at is staggered so the catalog's freshness labels vary
-- ("დღეს", "გუშინ", "N დღის წინ") instead of every card saying "today".
insert into public.vehicles (id, owner_id, make, model, year, mileage, fuel_type, transmission, city, category, condition, status, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Audi',          'A7',                2020, 50000, 'petrol', 'automatic', 'თბილისი', 'sedan', 'excellent', 'active', now() - interval '2 hours'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'BMW',           '550i',              2018, 70000, 'petrol', 'automatic', 'თბილისი', 'sedan', 'good',      'active', now() - interval '1 day'),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'BMW',           '530i',              2020, 42000, 'petrol', 'automatic', 'ბათუმი',  'sedan', 'excellent', 'active', now() - interval '2 days'),
  ('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Audi',          'A6',                2019, 61000, 'diesel', 'automatic', 'ბათუმი',  'sedan', 'good',      'active', now() - interval '3 days'),
  ('55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mercedes-Benz', 'E-Class',           2021, 30000, 'petrol', 'automatic', 'ბათუმი',  'sedan', 'excellent', 'active', now() - interval '4 days'),
  ('66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Toyota',        'Camry',             2019, 88000, 'hybrid', 'automatic', 'ბათუმი',  'sedan', 'good',      'active', now() - interval '5 days'),
  ('77777777-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Lexus',         'RX',                2020, 54000, 'hybrid', 'automatic', 'ბათუმი',  'suv',   'excellent', 'active', now() - interval '6 days'),
  ('88888888-8888-8888-8888-888888888888', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Land Rover',    'Range Rover Sport', 2018, 95000, 'diesel', 'automatic', 'ბათუმი',  'suv',   'good',      'active', now() - interval '8 days');

-- Swap preferences (cash terms). Inserting these runs matching (no desires yet).
insert into public.swap_preferences (vehicle_id, cash_mode, cash_amount)
values
  ('11111111-1111-1111-1111-111111111111', 'none',      0),
  ('22222222-2222-2222-2222-222222222222', 'add_money', 2000),
  ('33333333-3333-3333-3333-333333333333', 'ask_money', 1500),
  ('44444444-4444-4444-4444-444444444444', 'none',      0),
  ('55555555-5555-5555-5555-555555555555', 'ask_money', 4000),
  ('66666666-6666-6666-6666-666666666666', 'flexible',  0),
  ('77777777-7777-7777-7777-777777777777', 'none',      0),
  ('88888888-8888-8888-8888-888888888888', 'add_money', 3000);

-- Desired vehicles. The A<->B pair is mutual; the rest just populate the feed.
insert into public.desired_vehicles (vehicle_id, desired_make, desired_model, desired_category, min_year, max_year, label)
values
  ('11111111-1111-1111-1111-111111111111', 'BMW',           '550i',    null,  2018, 2018, 'BMW 550i 2018'),
  ('22222222-2222-2222-2222-222222222222', 'Audi',          'A7',      null,  2020, 2020, 'Audi A7 2020'),
  ('33333333-3333-3333-3333-333333333333', 'Mercedes-Benz', 'E-Class', null,  null, null, 'Mercedes-Benz E-Class'),
  ('44444444-4444-4444-4444-444444444444', null,            null,      'suv', null, null, 'ნებისმიერი SUV'),
  ('55555555-5555-5555-5555-555555555555', 'Lexus',         'RX',      null,  null, null, 'Lexus RX'),
  ('66666666-6666-6666-6666-666666666666', null,            null,      'sedan', null, null, 'ნებისმიერი სედანი'),
  ('77777777-7777-7777-7777-777777777777', 'Land Rover',    null,      null,  null, null, 'Land Rover'),
  ('88888888-8888-8888-8888-888888888888', 'Lexus',         'RX',      null,  null, null, 'Lexus RX');

-- Verification.
do $$
declare match_count int; notif_count int; offer_count int;
begin
  select count(*) into match_count from public.match_suggestions
  where vehicle_a_id = least('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid)
    and vehicle_b_id = greatest('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid);

  select count(*) into notif_count from public.notifications
  where type = 'match_found'
    and user_id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

  select count(*) into offer_count from public.offers;

  raise notice 'AutoSwap seed -> match_suggestions: % (expect 1), match notifications: % (expect 2), offers: % (expect 0)',
    match_count, notif_count, offer_count;

  if match_count <> 1 or notif_count <> 2 or offer_count <> 0 then
    raise warning 'Seed verification did not match expectations.';
  end if;
end $$;

select va.make || ' ' || va.model as vehicle_a, vb.make || ' ' || vb.model as vehicle_b,
       ms.match_level, ms.match_type, ms.status
from public.match_suggestions ms
join public.vehicles va on va.id = ms.vehicle_a_id
join public.vehicles vb on vb.id = ms.vehicle_b_id
where ms.vehicle_a_id in ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222')
   or ms.vehicle_b_id in ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');
