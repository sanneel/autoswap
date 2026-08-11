# Database setup checklist

This project's Supabase database was created from an early `schema.sql` and
nothing since. That is why several features fail at runtime with errors that
look like frontend bugs but are not:

| Symptom | Real cause |
|---|---|
| `Could not find the 'engine_size' column` when saving a listing | 6 columns missing from `vehicles` |
| Accepting / declining an offer does nothing ("მოქმედება ვერ შესრულდა") | `accept_offer` / `decline_offer` / `cancel_offer` do not exist |
| Phone login says "SMS სერვისი დროებით მიუწვდომელია" | `otp_rate_check` does not exist, and `request-otp` is not deployed |
| Match suggestions never appear | `matches` table and the matching triggers do not exist |

## Fix: run these in the Supabase SQL Editor, in this order

Each file is idempotent (`if not exists` / `create or replace`), so running one
twice is harmless.

1. `supabase/schema.sql` — adds the 6 missing `vehicles` columns and the
   `matches` table
2. `supabase/functions.sql` — all 18 RPCs and triggers, including the offer
   actions
3. `supabase/policies.sql` — row-level security
4. `supabase/storage.sql` — the listing-photos bucket
5. `supabase/otp_rate_limit.sql` — only if you want phone/SMS login

Then reload the API schema cache, or PostgREST keeps reporting the old shape:

```sql
notify pgrst, 'reload schema';
```

## Verify

```sql
-- Expect 6 rows.
select column_name from information_schema.columns
where table_schema='public' and table_name='vehicles'
  and column_name in ('estimated_value','engine_size','power_hp','color','latitude','longitude');

-- Expect accept_offer, cancel_offer, counter_offer, decline_offer, mark_offer_viewed.
select routine_name from information_schema.routines
where routine_schema='public' and routine_name like '%offer%'
order by routine_name;

-- Expect matches (and otp_requests if you ran step 5).
select table_name from information_schema.tables
where table_schema='public' and table_name in ('matches','otp_requests');
```

## Edge functions (separate from SQL)

None are currently deployed; all six return 404. They are only needed for
phone OTP and Telegram notifications, not for the core swap flow, which runs
on the SQL functions above.

```bash
supabase login
supabase link --project-ref lffxjaqeqvabmpiqyyrz
supabase functions deploy request-otp
```

Google sign-in is already enabled and needs none of this. Phone sign-in is
currently disabled in Auth settings, so the OTP path cannot work until that is
turned on and an SMS provider is configured.
