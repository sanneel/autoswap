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

rollback;

\echo 'otp-rate-limit.test.sql: all assertions passed'
