create table if not exists public.otp_requests (
  request_id  text primary key,
  phone       text not null,
  channel     text not null default 'SMS',
  purpose     text not null default 'login',
  user_id     uuid,
  attempts    integer not null default 0,
  created_at  timestamptz not null default now(),
  consumed_at timestamptz
);

create index if not exists otp_requests_created_idx
  on public.otp_requests (created_at desc);

alter table public.otp_requests enable row level security;
revoke all on public.otp_requests from anon, authenticated;

create or replace function public.otp_request_record(
  p_request_id text,
  p_phone      text,
  p_channel    text default 'SMS',
  p_purpose    text default 'login',
  p_user_id    uuid default null
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.otp_requests (request_id, phone, channel, purpose, user_id)
  values (p_request_id, p_phone, coalesce(p_channel, 'SMS'), coalesce(p_purpose, 'login'), p_user_id)
  on conflict (request_id) do nothing;
$$;

create or replace function public.otp_request_begin_verify(p_request_id text)
returns table (phone text, purpose text, user_id uuid)
language sql
security definer
set search_path = public
as $$
  update public.otp_requests r
     set attempts = r.attempts + 1
   where r.request_id = p_request_id
     and r.consumed_at is null
     and r.attempts < 6
     and r.created_at > now() - interval '15 minutes'
  returning r.phone, r.purpose, r.user_id;
$$;

create or replace function public.otp_request_claim(p_request_id text)
returns table (phone text, purpose text, user_id uuid)
language sql
security definer
set search_path = public
as $$
  update public.otp_requests r
     set consumed_at = now()
   where r.request_id = p_request_id
     and r.consumed_at is null
     and r.created_at > now() - interval '15 minutes'
  returning r.phone, r.purpose, r.user_id;
$$;

create or replace function public.otp_requests_prune()
returns integer
language sql
security definer
set search_path = public
as $$
  with gone as (
    delete from public.otp_requests
     where created_at < now() - interval '7 days'
    returning 1
  )
  select count(*)::int from gone;
$$;

create or replace function public.user_id_for_phone(p_phone text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
    from auth.users
   where phone in (replace(p_phone, '+', ''), p_phone)
      or raw_user_meta_data->>'phone' = p_phone
   order by created_at
   limit 1;
$$;

revoke all on function public.otp_request_record(text, text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.otp_request_begin_verify(text)                   from public, anon, authenticated;
revoke all on function public.otp_request_claim(text)                          from public, anon, authenticated;
revoke all on function public.otp_requests_prune()                             from public, anon, authenticated;
revoke all on function public.user_id_for_phone(text)                          from public, anon, authenticated;

grant execute on function public.otp_request_record(text, text, text, text, uuid) to service_role;
grant execute on function public.otp_request_begin_verify(text)                   to service_role;
grant execute on function public.otp_request_claim(text)                          to service_role;
grant execute on function public.otp_requests_prune()                             to service_role;
grant execute on function public.user_id_for_phone(text)                          to service_role;
