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

do $$ begin raise notice 'ALL SECURITY-HARDENING TESTS PASSED'; end $$;
rollback;
