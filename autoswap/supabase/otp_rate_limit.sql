create table if not exists public.otp_request_events (
  id         bigint generated always as identity primary key,
  ip         inet,
  phone      text,
  allowed    boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists otp_request_events_ip_time_idx
  on public.otp_request_events (ip, created_at desc);
create index if not exists otp_request_events_phone_time_idx
  on public.otp_request_events (phone, created_at desc);
create index if not exists otp_request_events_time_idx
  on public.otp_request_events (created_at desc);

create table if not exists public.otp_blocks (
  scope         text primary key,
  blocked_until timestamptz not null,
  reason        text,
  created_at    timestamptz not null default now()
);

create index if not exists otp_blocks_until_idx
  on public.otp_blocks (blocked_until);

alter table public.otp_request_events enable row level security;
alter table public.otp_blocks         enable row level security;

revoke all on table public.otp_request_events from anon, authenticated;
revoke all on table public.otp_blocks         from anon, authenticated;

create or replace function public.otp_rate_check(
  p_ip    inet,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Rule 1: per-IP burst
  c_ip_window    constant interval := interval '60 seconds';
  c_ip_max       constant int      := 2;            -- 3rd within the window blocks
  c_ip_block     constant interval := interval '5 minutes';
  -- Rule 2: per-phone bombing
  c_phone_window constant interval := interval '10 minutes';
  c_phone_max    constant int      := 3;            -- 4th within the window blocks
  c_phone_block  constant interval := interval '15 minutes';
  -- Rule 3: distributed (IP-rotation) velocity
  c_glob_window  constant interval := interval '30 seconds';
  c_glob_max_ips constant int      := 3;            -- 4th distinct IP trips the cooldown
  c_glob_block   constant interval := interval '3 minutes';

  v_now      timestamptz := now();
  v_until    timestamptz;
  v_ip_count int;
  v_ph_count int;
  v_ip_distinct int;
begin
  -- Opportunistic housekeeping (cheap, indexed); keeps the tables tiny.
  delete from public.otp_request_events where created_at < v_now - interval '1 hour';
  delete from public.otp_blocks         where blocked_until < v_now - interval '1 hour';

  -- 1) Already blocked? Reject before doing anything else. Most-global first.
  for v_until in
    select blocked_until from public.otp_blocks
     where blocked_until > v_now
       and scope in ('global',
                     'ip:'    || coalesce(host(p_ip), ''),
                     'phone:' || coalesce(p_phone, ''))
     order by case scope when 'global' then 0 else 1 end, blocked_until desc
  loop
    insert into public.otp_request_events (ip, phone, allowed) values (p_ip, p_phone, false);
    return jsonb_build_object(
      'allowed', false,
      'retry_after', greatest(1, ceil(extract(epoch from (v_until - v_now)))::int),
      'scope', 'blocked',
      'reason', 'temporarily blocked'
    );
  end loop;

  -- Record this attempt (counts below include it).
  insert into public.otp_request_events (ip, phone, allowed) values (p_ip, p_phone, true);

  -- 2) Per-IP burst.
  if p_ip is not null then
    select count(*) into v_ip_count
      from public.otp_request_events
     where ip = p_ip and created_at > v_now - c_ip_window;

    if v_ip_count > c_ip_max then
      v_until := v_now + c_ip_block;
      insert into public.otp_blocks (scope, blocked_until, reason)
        values ('ip:' || host(p_ip), v_until, 'per-ip burst')
        on conflict (scope) do update
          set blocked_until = greatest(public.otp_blocks.blocked_until, excluded.blocked_until),
              reason = excluded.reason, created_at = v_now;
      update public.otp_request_events set allowed = false
        where id = (select max(id) from public.otp_request_events);
      return jsonb_build_object('allowed', false,
        'retry_after', ceil(extract(epoch from c_ip_block))::int,
        'scope', 'ip', 'reason', 'too many requests from this network');
    end if;
  end if;

  -- 3) Per-phone bombing (protect the targeted number).
  if p_phone is not null then
    select count(*) into v_ph_count
      from public.otp_request_events
     where phone = p_phone and created_at > v_now - c_phone_window;

    if v_ph_count > c_phone_max then
      v_until := v_now + c_phone_block;
      insert into public.otp_blocks (scope, blocked_until, reason)
        values ('phone:' || p_phone, v_until, 'per-phone bombing')
        on conflict (scope) do update
          set blocked_until = greatest(public.otp_blocks.blocked_until, excluded.blocked_until),
              reason = excluded.reason, created_at = v_now;
      update public.otp_request_events set allowed = false
        where id = (select max(id) from public.otp_request_events);
      return jsonb_build_object('allowed', false,
        'retry_after', ceil(extract(epoch from c_phone_block))::int,
        'scope', 'phone', 'reason', 'too many codes requested for this number');
    end if;
  end if;

  -- 4) Distributed velocity: many distinct IPs in a tiny window = rotation.
  select count(distinct ip) into v_ip_distinct
    from public.otp_request_events
   where ip is not null and created_at > v_now - c_glob_window;

  if v_ip_distinct > c_glob_max_ips then
    v_until := v_now + c_glob_block;
    insert into public.otp_blocks (scope, blocked_until, reason)
      values ('global', v_until, 'distributed velocity')
      on conflict (scope) do update
        set blocked_until = greatest(public.otp_blocks.blocked_until, excluded.blocked_until),
            reason = excluded.reason, created_at = v_now;
    update public.otp_request_events set allowed = false
      where id = (select max(id) from public.otp_request_events);
    return jsonb_build_object('allowed', false,
      'retry_after', ceil(extract(epoch from c_glob_block))::int,
      'scope', 'global', 'reason', 'service temporarily throttled');
  end if;

  return jsonb_build_object('allowed', true, 'retry_after', 0, 'scope', 'ok', 'reason', '');
end;
$$;

revoke all on function public.otp_rate_check(inet, text) from public, anon, authenticated;
grant execute on function public.otp_rate_check(inet, text) to service_role;
