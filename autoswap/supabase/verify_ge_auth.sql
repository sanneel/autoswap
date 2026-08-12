-- =============================================================
-- verify.ge OTP support
--
-- verify.ge is a *closed-loop* verifier: it mints the code and checks it
-- itself (POST /otp/send → requestId, POST /otp/verify → success). The app
-- never sees the digits, which is why this cannot ride Supabase's "Send SMS"
-- auth hook — that hook hands you a code Supabase generated, and verify.ge
-- will not deliver a code it did not mint.
--
-- So Supabase Auth stops being the thing that verifies the number, and this
-- file supplies the two pieces the Edge Functions need to take over safely:
--
--   otp_requests        binds a requestId to the phone it was issued for
--   user_id_for_phone   resolves an existing auth user from a phone
--
-- The binding table is the security-critical half. `verify-otp` receives a
-- requestId from the browser; if it trusted a phone number sent alongside it,
-- anyone could request a code for their *own* number, verify it honestly, and
-- then claim the session belonged to somebody else's. The phone is therefore
-- read from this table and the client-supplied one is only ever used as a
-- cross-check.
--
-- Run after otp_rate_limit.sql.
-- =============================================================

-- --- requestId → phone binding ------------------------------------------
create table if not exists public.otp_requests (
  request_id  text primary key,
  phone       text not null,
  channel     text not null default 'SMS',
  purpose     text not null default 'login',
  user_id     uuid,                                   -- set for 'attach'
  attempts    integer not null default 0,
  created_at  timestamptz not null default now(),
  consumed_at timestamptz
);

create index if not exists otp_requests_created_idx
  on public.otp_requests (created_at desc);

-- Service role only. No policies are defined, so RLS denies every anon and
-- authenticated read outright; the service role bypasses RLS by design.
alter table public.otp_requests enable row level security;
revoke all on public.otp_requests from anon, authenticated;

-- Record a send. Called by `request-otp` right after verify.ge accepts.
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

-- Attempts allowed against one requestId before we stop asking the provider.
-- verify.ge enforces its own OTP_MAX_ATTEMPTS; this is a local backstop, since
-- we cannot see or rely on the value configured on their side.
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

-- Burn the request once the provider has confirmed the code. Separate from the
-- attempt step above so a mistyped digit costs an attempt, not the whole
-- request — the user gets to try again without waiting for a fresh SMS.
--
-- The single UPDATE ... RETURNING is what makes it single-use: two concurrent
-- verifies of the same requestId cannot both match `consumed_at is null`.
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

-- Housekeeping: the table is an audit trail of sends, but it does not need to
-- grow forever. Safe to call from a cron job.
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

-- --- phone → auth user lookup -------------------------------------------
-- auth.users is not reachable from PostgREST, and the admin REST API has no
-- efficient "find by phone". A SECURITY DEFINER function is the cheap,
-- reliable way for the Edge Function to resolve an existing account.
--
-- GoTrue stores E.164 without the leading '+', but both spellings are matched
-- so a row written by any other path still resolves.
--
-- user_metadata.phone is also checked. Enabling Supabase's phone provider
-- requires Twilio credentials this project does not have, so auth.users.phone
-- is written on a best-effort basis and the metadata copy is the one guaranteed
-- to be there. Matching both means a user resolves either way.
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

-- Every function here runs with definer rights over auth.users and the
-- binding table, so none of them may be reachable with the anon key.
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
