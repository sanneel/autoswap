-- =============================================================
-- otp-rate-limit.test.sql — unit test for public.otp_rate_check().
--
-- Covers the three guards:
--   1. per-IP burst        — 2 allowed, 3rd from the same IP blocked
--   2. per-phone bombing   — 3 allowed, 4th to the same number blocked
--   3. distributed velocity— 3 distinct IPs allowed, 4th trips a global cooldown
-- ...plus: an active block short-circuits later requests.
--
-- Requires otp_rate_limit.sql applied. A transaction has a single now(), so all
-- inserts land inside every time window — ideal for exercising the counters.
-- Tables are cleared between cases for isolation; the whole test rolls back.
--
--   psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/otp-rate-limit.test.sql
-- =============================================================

begin;

-- ---- 1) per-IP burst: 3rd request from one IP is blocked -----------------
do $$
declare v jsonb;
begin
  delete from public.otp_request_events; delete from public.otp_blocks;
  v := public.otp_rate_check('203.0.113.7', '+995500000001');
  assert (v->>'allowed')::boolean,     'ip burst: 1st should be allowed';
  v := public.otp_rate_check('203.0.113.7', '+995500000001');
  assert (v->>'allowed')::boolean,     'ip burst: 2nd should be allowed';
  v := public.otp_rate_check('203.0.113.7', '+995500000001');
  assert not (v->>'allowed')::boolean, 'ip burst: 3rd should be blocked';
  assert v->>'scope' = 'ip',           'ip burst: 3rd block scope should be ip';
  assert (v->>'retry_after')::int = 300, 'ip burst: retry_after should be 5 min';
end $$;

-- ---- 2) per-phone bombing: 4th code to one number is blocked -------------
-- Distinct IPs each time so the per-IP rule never fires; the phone rule is
-- evaluated before the global rule, so it wins on the 4th.
do $$
declare v jsonb;
begin
  delete from public.otp_request_events; delete from public.otp_blocks;
  v := public.otp_rate_check('198.51.100.1', '+995500000002');
  assert (v->>'allowed')::boolean,     'phone: 1st should be allowed';
  v := public.otp_rate_check('198.51.100.2', '+995500000002');
  assert (v->>'allowed')::boolean,     'phone: 2nd should be allowed';
  v := public.otp_rate_check('198.51.100.3', '+995500000002');
  assert (v->>'allowed')::boolean,     'phone: 3rd should be allowed';
  v := public.otp_rate_check('198.51.100.4', '+995500000002');
  assert not (v->>'allowed')::boolean, 'phone: 4th should be blocked';
  assert v->>'scope' = 'phone',        'phone: 4th block scope should be phone';
end $$;

-- ---- 3) distributed velocity: 4th distinct IP trips a global cooldown ----
-- Distinct IP AND distinct phone every time, so only the global rule applies.
do $$
declare v jsonb;
begin
  delete from public.otp_request_events; delete from public.otp_blocks;
  v := public.otp_rate_check('192.0.2.1', '+995500000101');
  assert (v->>'allowed')::boolean,     'global: 1st distinct IP allowed';
  v := public.otp_rate_check('192.0.2.2', '+995500000102');
  assert (v->>'allowed')::boolean,     'global: 2nd distinct IP allowed';
  v := public.otp_rate_check('192.0.2.3', '+995500000103');
  assert (v->>'allowed')::boolean,     'global: 3rd distinct IP allowed';
  v := public.otp_rate_check('192.0.2.4', '+995500000104');
  assert not (v->>'allowed')::boolean, 'global: 4th distinct IP blocked';
  assert v->>'scope' = 'global',       'global: block scope should be global';
  -- The cooldown is global: a brand-new IP/phone is now refused too.
  v := public.otp_rate_check('192.0.2.5', '+995500000105');
  assert not (v->>'allowed')::boolean, 'global: cooldown blocks unrelated client';
  assert v->>'scope' = 'blocked',      'global: later hit sees existing block';
end $$;

rollback;

\echo 'otp-rate-limit.test.sql: all assertions passed'
