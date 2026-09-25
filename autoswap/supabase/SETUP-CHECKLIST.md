# Database setup checklist

The production database was created from an early `schema.sql`, and only some
later files were applied to it. Measured on 2026-09-25 with read-only probes
(`node scripts/verify-production.mjs` repeats them):

| Applied | Missing |
|---|---|
| the `vehicles` columns, the offer RPCs (`accept_offer`, `decline_offer`, ...), `otp_rate_limit.sql`, `verify_ge_auth.sql` | the current `policies.sql`: `profiles` is still readable by any visitor |
| `request-otp`, `verify-otp` and `telegram-bot` are deployed | the current `schema.sql` view: `public_vehicle_feed` lacks `estimated_value` and the owner fields, so the price filter fails |

## Fix

Run every file in the order given in [`../LAUNCH.md`](../LAUNCH.md) (step 2),
then reload the schema cache, or PostgREST keeps reporting the old shape:

```sql
notify pgrst, 'reload schema';
```

The files are idempotent, and that order was tested against a database shaped
like production.

## Verify

```sql
-- Expect 0: profiles are own-row only.
set role anon; select count(*) from public.profiles; reset role;

-- Expect estimated_value, owner_name, owner_phone_verified, description among the columns.
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'public_vehicle_feed';

-- Expect account_is_trusted and squatted_shadow_account.
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_name in ('account_is_trusted', 'squatted_shadow_account');

-- Expect match_suggestions, client_errors and otp_requests.
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('match_suggestions', 'client_errors', 'otp_requests');
```

## Edge functions

Only `request-otp`, `verify-otp` and (for Telegram) `telegram-bot` /
`telegram-notify` are needed; the offer actions run on the SQL functions.
Deploy commands and the `VERIFY_GE_API_KEY` secret are in `LAUNCH.md` step 3.
