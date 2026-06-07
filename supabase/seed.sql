-- =============================================================
-- SwapRide seed data — for local development only.
-- Uses synthetic UUIDs; run after creating auth users with the same ids
-- via the dashboard, or rely on these as illustrative fixtures.
-- =============================================================

-- Three demo users. In real seeding, create these in auth.users first.
insert into public.profiles (id, full_name, city, country, bio)
values
  ('11111111-1111-1111-1111-111111111111', 'Anna Smith',   'Lisbon',  'Portugal', 'Loves crossovers.'),
  ('22222222-2222-2222-2222-222222222222', 'Bruno Costa',  'Porto',   'Portugal', 'Wants something sporty.'),
  ('33333333-3333-3333-3333-333333333333', 'Cláudia Reis', 'Aveiro',  'Portugal', 'Electric vehicle enthusiast.')
on conflict (id) do nothing;

-- Cars
insert into public.cars
  (id, owner_id, make, model, year, mileage_km, fuel_type, transmission, engine_size_l, color, description)
values
  ('aaaaaaa1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Audi','A4',2019,82000,'diesel','automatic',2.0,'Black','Well maintained, full service history.'),
  ('aaaaaaa1-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'BMW','X5',2020,65000,'petrol','automatic',3.0,'White','One owner, pano roof.'),
  ('aaaaaaa1-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333',
   'Tesla','Model 3',2022,30000,'electric','automatic',0.0,'Blue','LR, autopilot, garage kept.')
on conflict (id) do nothing;

-- Preferences
insert into public.vehicle_preferences (car_id, money_adjustment, money_amount, currency) values
  ('aaaaaaa1-0000-0000-0000-000000000001','wants_money', 5000, 'EUR'),
  ('aaaaaaa1-0000-0000-0000-000000000002','none',         null, 'EUR'),
  ('aaaaaaa1-0000-0000-0000-000000000003','adds_money',  3000, 'EUR')
on conflict (car_id) do update set
  money_adjustment = excluded.money_adjustment,
  money_amount     = excluded.money_amount;

-- Desired
insert into public.desired_vehicles (car_id, make, model, year_min, year_max, category) values
  ('aaaaaaa1-0000-0000-0000-000000000001', 'BMW','X5',2018,2024,'suv'),
  ('aaaaaaa1-0000-0000-0000-000000000002', 'Audi','A4',2017,2024,'sedan'),
  ('aaaaaaa1-0000-0000-0000-000000000002', null,null,null,null,'electric'),
  ('aaaaaaa1-0000-0000-0000-000000000003', 'BMW','X5',null,null,'any');
