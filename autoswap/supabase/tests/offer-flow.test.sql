-- =============================================================
-- offer-flow.test.sql — integration test for the offer lifecycle.
--
-- Covers:
--   * accept_offer completes the swap atomically:
--       - offer -> accepted, conversation created
--       - both vehicles -> completed
--       - competing open offers on either vehicle -> auto-declined
--       - completed_swaps_count bumped for both parties
--   * accept_offer refuses a second accept on an already-swapped vehicle
--   * cancel_offer is sender-only and only from pending/viewed
--
-- Run against a LOCAL database that has schema.sql + functions.sql +
-- policies.sql applied (see supabase/README.md). Never run in production.
--
--   psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/offer-flow.test.sql
--
-- auth.uid() is simulated through request.jwt.claim.sub, exactly how
-- PostgREST/Supabase provide it. The whole test rolls back.
-- =============================================================

begin;

-- Make notification/event triggers run as usual; we assert on their output.

do $$
declare
  u_a uuid;  -- owns car_a, sends the main offer
  u_b uuid;  -- owns car_b, receives + accepts
  u_c uuid;  -- owns car_c, sends a competing offer on car_b
  car_a  uuid;
  car_b  uuid;
  car_c  uuid;
  main_offer      uuid;
  competing_offer uuid;
  conv            uuid;
  n               int;
  txt             text;
begin
  -- ---- fixtures -------------------------------------------------------
  insert into auth.users (email) values ('a@test.local') returning id into u_a;
  insert into auth.users (email) values ('b@test.local') returning id into u_b;
  insert into auth.users (email) values ('c@test.local') returning id into u_c;

  insert into public.vehicles (owner_id, make, model, year, mileage, city, condition, status, estimated_value)
  values (u_a, 'Toyota', 'Camry', 2020, 80000, 'Tbilisi', 'good', 'active', 45000)
  returning id into car_a;
  insert into public.vehicles (owner_id, make, model, year, mileage, city, condition, status, estimated_value)
  values (u_b, 'BMW', '530i', 2019, 90000, 'Tbilisi', 'good', 'active', 50000)
  returning id into car_b;
  insert into public.vehicles (owner_id, make, model, year, mileage, city, condition, status, estimated_value)
  values (u_c, 'Audi', 'A6', 2021, 60000, 'Batumi', 'excellent', 'active', 60000)
  returning id into car_c;

  insert into public.offers (target_vehicle_id, offered_vehicle_id, from_user_id, to_user_id, cash_mode, cash_amount)
  values (car_b, car_a, u_a, u_b, 'add_money', 2000)
  returning id into main_offer;

  insert into public.offers (target_vehicle_id, offered_vehicle_id, from_user_id, to_user_id)
  values (car_b, car_c, u_c, u_b)
  returning id into competing_offer;

  -- ---- guard: only the receiver may accept ------------------------------
  perform set_config('request.jwt.claim.sub', u_a::text, true);
  begin
    perform public.accept_offer(main_offer);
    raise exception 'TEST FAILED: sender was able to accept their own offer';
  exception when others then
    if sqlerrm like 'TEST FAILED%' then raise; end if;
  end;

  -- ---- guard: cancel is sender-only --------------------------------------
  perform set_config('request.jwt.claim.sub', u_b::text, true);
  begin
    perform public.cancel_offer(main_offer);
    raise exception 'TEST FAILED: receiver was able to cancel the offer';
  exception when others then
    if sqlerrm like 'TEST FAILED%' then raise; end if;
  end;

  -- ---- accept the main offer as the receiver ----------------------------
  perform set_config('request.jwt.claim.sub', u_b::text, true);
  conv := public.accept_offer(main_offer);
  if conv is null then raise exception 'TEST FAILED: no conversation returned'; end if;

  select status into txt from public.offers where id = main_offer;
  if txt <> 'accepted' then raise exception 'TEST FAILED: main offer is %, expected accepted', txt; end if;

  -- both vehicles swapped out of the market
  select count(*) into n from public.vehicles
   where id in (car_a, car_b) and status = 'completed';
  if n <> 2 then raise exception 'TEST FAILED: % of 2 vehicles completed', n; end if;

  -- competing offer auto-declined
  select status into txt from public.offers where id = competing_offer;
  if txt <> 'declined' then raise exception 'TEST FAILED: competing offer is %, expected declined', txt; end if;

  -- competing sender notified
  select count(*) into n from public.notifications
   where user_id = u_c and type = 'offer_declined' and related_offer_id = competing_offer;
  if n <> 1 then raise exception 'TEST FAILED: competing sender got % decline notifications', n; end if;

  -- swap counters bumped
  select count(*) into n from public.profiles
   where id in (u_a, u_b) and completed_swaps_count = 1;
  if n <> 2 then raise exception 'TEST FAILED: completed_swaps_count not bumped for both parties'; end if;

  -- conversation joins the two parties
  select count(*) into n from public.conversations c
   where id = conv and c.user_a = u_a and c.user_b = u_b;
  if n <> 1 then raise exception 'TEST FAILED: conversation parties wrong'; end if;

  -- ---- a second accept on a swapped vehicle must fail --------------------
  begin
    perform public.accept_offer(competing_offer);
    raise exception 'TEST FAILED: accepted an offer on an already-swapped vehicle';
  exception when others then
    if sqlerrm like 'TEST FAILED%' then raise; end if;
  end;

  -- ---- cancel_offer happy path -------------------------------------------
  update public.vehicles set status = 'active' where id = car_c; -- C re-lists
  insert into public.offers (target_vehicle_id, offered_vehicle_id, from_user_id, to_user_id)
  values (car_c, car_a, u_a, u_c)
  returning id into main_offer;
  -- car_a is completed, but cancel must work regardless of vehicle state
  perform set_config('request.jwt.claim.sub', u_a::text, true);
  perform public.cancel_offer(main_offer);
  select status into txt from public.offers where id = main_offer;
  if txt <> 'cancelled' then raise exception 'TEST FAILED: offer is %, expected cancelled', txt; end if;

  -- cancelled event logged by the status trigger
  select count(*) into n from public.offer_events
   where offer_id = main_offer and event_type = 'cancelled';
  if n <> 1 then raise exception 'TEST FAILED: cancelled event not logged'; end if;

  raise notice 'ALL OFFER-FLOW TESTS PASSED';
end;
$$;

rollback;
