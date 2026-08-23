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
  -- Resolve a phone-OTP login to an account.
  --
  -- Only two sources are consulted, and BOTH are writable exclusively by the
  -- service role:
  --   1. auth.users.phone                     - set by GoTrue with phone_confirm
  --   2. raw_app_meta_data->>'verified_phone' - stamped by the verify-otp Edge
  --                                             Function after a proven OTP
  --
  -- raw_user_meta_data is deliberately NOT consulted: any signed-in client can
  -- write it with auth.updateUser({data:{phone}}), so trusting it lets an
  -- attacker claim a victim's number and capture that victim's sign-in.
  -- Legacy accounts whose number lived only in user_metadata are migrated by
  -- public.backfill_verified_phones() below.
  select id
    from auth.users
   where phone in (replace(p_phone, '+', ''), p_phone)
      or raw_app_meta_data->>'verified_phone' = p_phone
   order by
     coalesce(phone in (replace(p_phone, '+', ''), p_phone), false) desc,  -- verified column first (NULL phone -> false)
     created_at
   limit 1;
$$;

-- One-time migration for accounts created before verified_phone existed: those
-- whose number lives only in the client-writable user_metadata (the retry
-- fallback in verify-otp used to create them without a phone column). Promotes
-- the claim into service-role-only app_metadata so the account stays reachable
-- after user_id_for_phone stopped reading user_metadata.
--
-- A metadata claim is promoted ONLY when it is uncontested: skipped if any
-- account already holds that number in the verified phone column, and skipped
-- if more than one account claims it. Those rows are returned for an operator
-- to resolve by hand rather than silently blessed. Idempotent; returns a report.
--
-- NOTE: a claim that was already forged before this migration is
-- indistinguishable from a genuine one, so run this promptly and review the
-- report. It does not make such a claim any stronger than it is today (that
-- account already wins resolution) - it only stops NEW forgeries from counting.
create or replace function public.backfill_verified_phones()
returns table (user_id uuid, claimed_phone text, action text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  ph text;
begin
  for r in
    select u.id, u.raw_user_meta_data->>'phone' as meta_phone
      from auth.users u
     where u.phone is null
       and coalesce(u.raw_user_meta_data->>'phone', '') <> ''
       and u.raw_app_meta_data->>'verified_phone' is null
     order by u.created_at
  loop
    ph := r.meta_phone;

    if exists (select 1 from auth.users v
                where v.phone in (replace(ph, '+', ''), ph)) then
      user_id := r.id; claimed_phone := ph; action := 'skipped_claimed_by_verified';
      return next; continue;
    end if;

    if (select count(*) from auth.users v
         where v.phone is null
           and v.raw_user_meta_data->>'phone' = ph) > 1 then
      user_id := r.id; claimed_phone := ph; action := 'skipped_ambiguous';
      return next; continue;
    end if;

    update auth.users
       set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                             || jsonb_build_object('verified_phone', ph)
     where id = r.id;
    user_id := r.id; claimed_phone := ph; action := 'promoted';
    return next;
  end loop;
end;
$$;

revoke all on function public.otp_request_record(text, text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.otp_request_begin_verify(text)                   from public, anon, authenticated;
revoke all on function public.otp_request_claim(text)                          from public, anon, authenticated;
revoke all on function public.otp_requests_prune()                             from public, anon, authenticated;
revoke all on function public.user_id_for_phone(text)                          from public, anon, authenticated;
revoke all on function public.backfill_verified_phones()                        from public, anon, authenticated;

grant execute on function public.otp_request_record(text, text, text, text, uuid) to service_role;
grant execute on function public.otp_request_begin_verify(text)                   to service_role;
grant execute on function public.otp_request_claim(text)                          to service_role;
grant execute on function public.otp_requests_prune()                             to service_role;
grant execute on function public.user_id_for_phone(text)                          to service_role;
grant execute on function public.backfill_verified_phones()                        to service_role;
