-- Regression tests for the second-pass security hardening (see SECURITY.md).
-- Self-contained; creates its own fixtures and rolls everything back.
--   psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/security-hardening.test.sql
begin;

-- Supabase grants table privileges to authenticated by default; reproduce that so
-- the column REVOKE is (correctly) shown to be a no-op and the trigger is what
-- actually holds. GRANTs are transactional and roll back with this test.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ============================================================================
-- P0: profiles_guard_trust freezes trust/verification columns for client writes,
--     but lets SECURITY DEFINER RPCs (accept_offer) update them.
-- ============================================================================
do $$
declare
  u_a uuid; u_b uuid; car_a uuid; car_b uuid; off_id uuid;
  pv boolean; sw int; nm text; sw0 int; sw1 int;
begin
  insert into auth.users(email) values('sec_a@test.local') returning id into u_a;
  insert into auth.users(email) values('sec_b@test.local') returning id into u_b;

  -- --- client trust forgery must be neutralized -----------------------------
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', u_a::text, true);
  update public.profiles
     set phone_verified = true, completed_swaps_count = 999, response_rate = 1.0
   where id = u_a;
  reset role;
  select phone_verified, completed_swaps_count into pv, sw from public.profiles where id = u_a;
  if pv is true or sw = 999 then
    raise exception 'TEST FAILED: client forged trust columns (phone_verified=%, swaps=%)', pv, sw;
  end if;

  -- --- legitimate profile edits still succeed -------------------------------
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', u_a::text, true);
  update public.profiles set display_name = 'Legit', city = 'Batumi', phone = '+995500111222' where id = u_a;
  reset role;
  select display_name into nm from public.profiles where id = u_a;
  if nm <> 'Legit' then raise exception 'TEST FAILED: legitimate profile edit was blocked (name=%)', nm; end if;

  -- --- accept_offer (SECURITY DEFINER) must STILL bump the swap counter ------
  insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status,estimated_value)
    values (u_a,'Toyota','Camry',2020,80000,'Tbilisi','good','active',45000) returning id into car_a;
  insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status,estimated_value)
    values (u_b,'BMW','530i',2019,90000,'Tbilisi','good','active',50000) returning id into car_b;
  insert into public.offers(target_vehicle_id,offered_vehicle_id,from_user_id,to_user_id,cash_mode,cash_amount)
    values (car_b,car_a,u_a,u_b,'add_money',2000) returning id into off_id;

  select completed_swaps_count into sw0 from public.profiles where id = u_b;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', u_b::text, true);
  perform public.accept_offer(off_id);
  reset role;
  select completed_swaps_count into sw1 from public.profiles where id = u_b;
  if sw1 <> sw0 + 1 then
    raise exception 'TEST FAILED: accept_offer no longer bumps completed_swaps_count (%->%)', sw0, sw1;
  end if;
end $$;

-- ============================================================================
-- P1: user_id_for_phone must prefer the GoTrue-verified phone column over the
--     client-writable raw_user_meta_data->>'phone'.
-- ============================================================================
do $$
declare resolved uuid; victim uuid; legacy uuid;
begin
  -- attacker: older account, phone only in forgeable metadata = victim's number
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('atk@test.local', null, '{"phone":"+995599111222"}'::jsonb, now() - interval '10 days');
  -- victim: newer account, phone in the verified column
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('vic@test.local', '+995599111222', '{}'::jsonb, now() - interval '1 day')
    returning id into victim;
  resolved := public.user_id_for_phone('+995599111222');
  if resolved is distinct from victim then
    raise exception 'TEST FAILED: phone resolution picked forged-metadata account, not the verified one';
  end if;

  -- metadata-only fallback still resolves when no verified-column account exists
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('leg@test.local', null, '{"phone":"+995599777888"}'::jsonb, now() - interval '3 days')
    returning id into legacy;
  if public.user_id_for_phone('+995599777888') is distinct from legacy then
    raise exception 'TEST FAILED: legacy metadata-only phone no longer resolves';
  end if;

  -- unknown phone resolves to nothing (a new account gets created downstream)
  if public.user_id_for_phone('+995599000000') is not null then
    raise exception 'TEST FAILED: unknown phone resolved to an account';
  end if;
end $$;

do $$ begin raise notice 'ALL SECURITY-HARDENING TESTS PASSED'; end $$;
rollback;
