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
-- P1: user_id_for_phone must resolve logins ONLY from service-role-writable
--     sources (the GoTrue-verified phone column and app_metadata). The
--     client-writable raw_user_meta_data must never decide an identity.
-- ============================================================================
do $$
declare victim uuid; appmeta uuid;
begin
  -- A verified phone-column account must win over a forged metadata claim, even
  -- when the forger's account is older.
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('atk@test.local', null, '{"phone":"+995599111222"}'::jsonb, now() - interval '10 days');
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('vic@test.local', '+995599111222', '{}'::jsonb, now() - interval '1 day')
    returning id into victim;
  if public.user_id_for_phone('+995599111222') is distinct from victim then
    raise exception 'TEST FAILED: phone resolution picked the forged-metadata account';
  end if;

  -- A forged metadata claim ALONE must resolve to nothing. Otherwise a victim
  -- who has no account yet gets funnelled into the attacker's account on their
  -- first genuine OTP sign-in.
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('forger@test.local', null, '{"phone":"+995599555000"}'::jsonb, now() - interval '5 days');
  if public.user_id_for_phone('+995599555000') is not null then
    raise exception 'TEST FAILED: client-writable user_metadata still resolves an identity';
  end if;

  -- app_metadata.verified_phone (service-role only, stamped by verify-otp) does resolve.
  insert into auth.users(email, phone, raw_app_meta_data, created_at)
    values ('app@test.local', null, '{"verified_phone":"+995599777888"}'::jsonb, now() - interval '3 days')
    returning id into appmeta;
  if public.user_id_for_phone('+995599777888') is distinct from appmeta then
    raise exception 'TEST FAILED: app_metadata.verified_phone does not resolve';
  end if;

  -- unknown phone resolves to nothing (a new account gets created downstream)
  if public.user_id_for_phone('+995599000000') is not null then
    raise exception 'TEST FAILED: unknown phone resolved to an account';
  end if;
end $$;

-- ============================================================================
-- backfill_verified_phones(): promotes only UNCONTESTED legacy metadata claims
-- into app_metadata, and reports the rest instead of blessing them.
-- ============================================================================
do $$
declare legacy uuid; owner_id uuid; n int;
begin
  -- uncontested legacy account (old verify-otp retry fallback: no phone column)
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('legacy@test.local', null, '{"phone":"+995599000111"}'::jsonb, now() - interval '9 days')
    returning id into legacy;
  -- contested: a verified account already owns this number
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('claimer@test.local', null, '{"phone":"+995599000222"}'::jsonb, now() - interval '9 days');
  insert into auth.users(email, phone, created_at)
    values ('realowner@test.local', '+995599000222', now() - interval '8 days')
    returning id into owner_id;
  -- ambiguous: two metadata-only accounts claim the same number
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('dup1@test.local', null, '{"phone":"+995599000333"}'::jsonb, now() - interval '7 days');
  insert into auth.users(email, phone, raw_user_meta_data, created_at)
    values ('dup2@test.local', null, '{"phone":"+995599000333"}'::jsonb, now() - interval '6 days');

  perform public.backfill_verified_phones();

  if public.user_id_for_phone('+995599000111') is distinct from legacy then
    raise exception 'TEST FAILED: uncontested legacy account was not migrated and is now unreachable';
  end if;
  if public.user_id_for_phone('+995599000222') is distinct from owner_id then
    raise exception 'TEST FAILED: backfill let a metadata claim override a verified owner';
  end if;
  if public.user_id_for_phone('+995599000333') is not null then
    raise exception 'TEST FAILED: backfill blessed an ambiguous claim instead of reporting it';
  end if;

  -- idempotent: a second run must promote nothing
  select count(*) into n from public.backfill_verified_phones() where action = 'promoted';
  if n <> 0 then
    raise exception 'TEST FAILED: backfill is not idempotent (% promoted on rerun)', n;
  end if;
end $$;

-- ============================================================================
-- telegram_chat_id: only the bot (service role) may set it - the same
-- ineffective column REVOKE as the profiles trust columns. Skipped when the
-- optional telegram.sql has not been applied.
-- ============================================================================
do $$
declare u uuid; chat text; code text;
begin
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'profiles'
                    and column_name = 'telegram_chat_id') then
    raise notice 'telegram.sql not applied - skipping telegram_chat_id guard test';
    return;
  end if;

  insert into auth.users(email) values('tg@test.local') returning id into u;
  update public.profiles set telegram_chat_id = '555000111' where id = u;  -- as the bot

  -- client tries to repoint the chat id, and legitimately sets a link code
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', u::text, true);
  update public.profiles
     set telegram_chat_id = '999999999', telegram_link_code = 'abc123'
   where id = u;
  reset role;

  select telegram_chat_id, telegram_link_code into chat, code from public.profiles where id = u;
  if chat <> '555000111' then
    raise exception 'TEST FAILED: client repointed telegram_chat_id (now %)', chat;
  end if;
  if code is distinct from 'abc123' then
    raise exception 'TEST FAILED: client could not set telegram_link_code (got %)', code;
  end if;

  -- the bot (service role) must still be able to link a chat
  update public.profiles set telegram_chat_id = '777000222' where id = u;
  select telegram_chat_id into chat from public.profiles where id = u;
  if chat <> '777000222' then
    raise exception 'TEST FAILED: service role can no longer link a chat (got %)', chat;
  end if;
end $$;

-- ============================================================================
-- P0: profiles are private. Production ran with `using (true)` until the
--     current policies.sql was applied, which exposed every phone number.
-- ============================================================================
do $$
declare u_a uuid; u_b uuid; seen int;
begin
  insert into auth.users(email) values('priv_a@test.local') returning id into u_a;
  insert into auth.users(email) values('priv_b@test.local') returning id into u_b;
  update public.profiles set phone = '+995500123456' where id = u_b;

  -- earlier blocks leave a signed-in subject behind; an anonymous visitor has none
  perform set_config('request.jwt.claim.sub', '', true);
  set local role anon;
  select count(*) into seen from public.profiles;
  reset role;
  if seen <> 0 then raise exception 'TEST FAILED: anon can read % profile rows', seen; end if;

  set local role authenticated;
  perform set_config('request.jwt.claim.sub', u_a::text, true);
  select count(*) into seen from public.profiles where id <> u_a;
  reset role;
  if seen <> 0 then raise exception 'TEST FAILED: a user can read % other profiles', seen; end if;
end $$;

-- ============================================================================
-- P1: listings and offers need a verified phone or an OAuth login. The email
--     sign-up endpoint is public (phone+password login needs it), so an
--     account made there with a bare address must not be able to post.
-- ============================================================================
do $$
declare
  bare uuid; phone_col uuid; stamped uuid; google uuid; linked uuid;
  bare_car uuid; target uuid; blocked boolean;
begin
  insert into auth.users(email) values('bare@test.local') returning id into bare;
  insert into auth.users(email, phone, phone_confirmed_at) values('pc@test.local', '995500000001', now()) returning id into phone_col;
  insert into auth.users(email, raw_app_meta_data)
    values('p995500000002@phone.autoswap.ge', '{"provider":"email","providers":["email"],"verified_phone":"+995500000002"}') returning id into stamped;
  insert into auth.users(email, raw_app_meta_data)
    values('g@test.local', '{"provider":"google","providers":["google"]}') returning id into google;
  insert into auth.users(email, raw_app_meta_data)
    values('gl@test.local', '{"provider":"email","providers":["email","google"]}') returning id into linked;

  -- the bare account cannot list a car
  blocked := false;
  begin
    set local role authenticated;
    perform set_config('request.jwt.claim.sub', bare::text, true);
    insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status)
      values (bare,'Opel','Astra',2012,150000,'Tbilisi','good','active');
    reset role;
  exception when insufficient_privilege then
    blocked := true;
    reset role;
  end;
  if not blocked then raise exception 'TEST FAILED: an email-only account listed a car'; end if;

  -- every trusted shape can
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', phone_col::text, true);
  insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status)
    values (phone_col,'Toyota','Prius',2015,120000,'Tbilisi','good','active') returning id into target;
  perform set_config('request.jwt.claim.sub', stamped::text, true);
  insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status)
    values (stamped,'Honda','Fit',2014,110000,'Tbilisi','good','active');
  perform set_config('request.jwt.claim.sub', google::text, true);
  insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status)
    values (google,'Mazda','3',2016,90000,'Tbilisi','good','active');
  perform set_config('request.jwt.claim.sub', linked::text, true);
  insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status)
    values (linked,'Kia','Rio',2017,80000,'Tbilisi','good','active');
  reset role;

  -- a bare account that somehow holds a listing still cannot send an offer
  insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status)
    values (bare,'Opel','Astra',2012,150000,'Tbilisi','good','active') returning id into bare_car;
  blocked := false;
  begin
    set local role authenticated;
    perform set_config('request.jwt.claim.sub', bare::text, true);
    insert into public.offers(target_vehicle_id,offered_vehicle_id,from_user_id,to_user_id,cash_mode,cash_amount)
      values (target,bare_car,bare,phone_col,'none',0);
    reset role;
  exception when insufficient_privilege then
    blocked := true;
    reset role;
  end;
  if not blocked then raise exception 'TEST FAILED: an email-only account sent an offer'; end if;
end $$;

-- ============================================================================
-- P2: squatted_shadow_account finds only accounts verify-otp did not create,
--     so a pre-registered shadow email cannot block a number's real owner.
-- ============================================================================
do $$
declare squat uuid; got uuid; denied boolean;
begin
  insert into auth.users(email) values('p995500000010@phone.autoswap.ge') returning id into squat;
  insert into auth.users(email, email_confirmed_at) values('p995500000011@phone.autoswap.ge', now());
  insert into auth.users(email, last_sign_in_at) values('p995500000012@phone.autoswap.ge', now());
  insert into auth.users(email, raw_app_meta_data) values('p995500000013@phone.autoswap.ge', '{"verified_phone":"+995500000013"}');

  got := public.squatted_shadow_account('p995500000010@phone.autoswap.ge');
  if got is distinct from squat then raise exception 'TEST FAILED: squatter not found (got %)', got; end if;
  if public.squatted_shadow_account('p995500000011@phone.autoswap.ge') is not null then
    raise exception 'TEST FAILED: a confirmed shadow account was treated as a squatter';
  end if;
  if public.squatted_shadow_account('p995500000012@phone.autoswap.ge') is not null then
    raise exception 'TEST FAILED: an account that has signed in was treated as a squatter';
  end if;
  if public.squatted_shadow_account('p995500000013@phone.autoswap.ge') is not null then
    raise exception 'TEST FAILED: a phone-verified account was treated as a squatter';
  end if;

  insert into public.vehicles(owner_id,make,model,year,mileage,city,condition,status)
    values (squat,'Opel','Astra',2012,150000,'Tbilisi','good','draft');
  if public.squatted_shadow_account('p995500000010@phone.autoswap.ge') is not null then
    raise exception 'TEST FAILED: an account that owns a listing was treated as a squatter';
  end if;

  denied := false;
  begin
    set local role authenticated;
    perform public.squatted_shadow_account('p995500000010@phone.autoswap.ge');
    reset role;
  exception when insufficient_privilege then
    denied := true;
    reset role;
  end;
  if not denied then raise exception 'TEST FAILED: clients can call squatted_shadow_account'; end if;
end $$;

-- ============================================================================
-- P2: client_errors is write-only for browsers, cannot be attributed to
--     another user, and cannot be flooded past the per-minute cap.
-- ============================================================================
do $$
declare u uuid; other uuid; seen int; blocked boolean; stored int;
begin
  insert into auth.users(email) values('err_a@test.local') returning id into u;
  insert into auth.users(email) values('err_b@test.local') returning id into other;

  perform set_config('request.jwt.claim.sub', '', true);
  set local role anon;
  insert into public.client_errors(page, message) values ('/cars', 'TypeError: x is undefined');
  select count(*) into seen from public.client_errors;
  reset role;
  if seen <> 0 then raise exception 'TEST FAILED: anon can read % client_errors rows', seen; end if;

  blocked := false;
  begin
    set local role authenticated;
    perform set_config('request.jwt.claim.sub', u::text, true);
    insert into public.client_errors(page, message, user_id) values ('/cars', 'forged', other);
    reset role;
  exception when insufficient_privilege then
    blocked := true;
    reset role;
  end;
  if not blocked then raise exception 'TEST FAILED: a report was attributed to another user'; end if;

  perform set_config('request.jwt.claim.sub', '', true);
  set local role anon;
  for i in 1..200 loop
    insert into public.client_errors(page, message) values ('/flood', 'flood ' || i);
  end loop;
  reset role;
  select count(*) into stored from public.client_errors where created_at > now() - interval '1 minute';
  if stored > 120 then raise exception 'TEST FAILED: flood stored % rows past the 120/minute cap', stored; end if;
end $$;

do $$ begin raise notice 'ALL SECURITY-HARDENING TESTS PASSED'; end $$;
rollback;
