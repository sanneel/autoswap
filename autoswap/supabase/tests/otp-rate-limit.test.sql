begin;

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


-- The distributed rule must not be a DoS lever: one caller varying its apparent
-- IP against a SINGLE number must never trip the global cooldown, because that
-- would deny sign-in to everyone else.
do $$
declare v jsonb;
begin
  delete from public.otp_request_events; delete from public.otp_blocks;
  v := public.otp_rate_check('192.0.2.11', '+995500000201');
  v := public.otp_rate_check('192.0.2.12', '+995500000201');
  v := public.otp_rate_check('192.0.2.13', '+995500000201');
  v := public.otp_rate_check('192.0.2.14', '+995500000201');   -- 4 distinct IPs, one number
  assert not (v->>'allowed')::boolean, 'single-number flood should still be blocked';
  assert v->>'scope' = 'phone',
    format('flood at one number must block by phone, not globally (scope=%s)', v->>'scope');
  assert not exists (select 1 from public.otp_blocks
                      where scope = 'global' and blocked_until > now()),
    'a single-number flood must not raise a GLOBAL block';

  -- an unrelated user is still able to sign in
  v := public.otp_rate_check('198.51.100.77', '+995500000299');
  assert (v->>'allowed')::boolean, 'bystander was denied - the global DoS lever is still open';
end $$;

-- A genuine rotation attack - many IPs across many numbers - must still trip it.
do $$
declare v jsonb;
begin
  delete from public.otp_request_events; delete from public.otp_blocks;
  v := public.otp_rate_check('192.0.2.21', '+995500000301');
  v := public.otp_rate_check('192.0.2.22', '+995500000302');
  v := public.otp_rate_check('192.0.2.23', '+995500000303');
  v := public.otp_rate_check('192.0.2.24', '+995500000304');
  assert not (v->>'allowed')::boolean, 'distributed rotation should be blocked';
  assert v->>'scope' = 'global', format('rotation should trip the global scope (scope=%s)', v->>'scope');
end $$;

rollback;

\echo 'otp-rate-limit.test.sql: all assertions passed'
