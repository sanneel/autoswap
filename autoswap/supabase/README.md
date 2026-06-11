# AutoSwap — Supabase setup

Run these SQL files in the Supabase SQL editor **in order** (all idempotent;
re-running upgrades an existing deployment in place — new columns are added
with `add column if not exists`):

1. `schema.sql` — tables, indexes, core triggers (profile creation,
   `updated_at`), the `public_vehicle_feed` view, and Realtime publication.
   Vehicles carry the v2 listing fields: `estimated_value`, `engine_size`,
   `power_hp`, `color`, `latitude`/`longitude`.
2. `functions.sql` — mutual matching (`vehicle_matches_desire`,
   `find_mutual_matches_for_vehicle`), the atomic `accept_offer` (locks both
   vehicles, marks them `completed`, auto-declines competing open offers,
   bumps swap counters), `cancel_offer`, and notification triggers.
3. `policies.sql` — Row Level Security for every table. Clients can only
   *cancel* their own outgoing offers; every other offer transition goes
   through a `SECURITY DEFINER` RPC.
4. `storage.sql` — the public `vehicle-photos` bucket and owner-only
   upload/delete policies.
5. `car_catalog.sql` — public-read `car_makes` and `car_models` tables with
   trigram indexes, `is_active` curation flags (deactivated rows are hidden
   by RLS) and the service-role-only `set_car_make_active` /
   `set_car_model_active` admin helpers.
6. `seed.sql` — **local dev only**. Inserts two users and the canonical
   mutual-match test (Audi A7 ⇄ BMW 550i). Expects 1 match suggestion, 2
   notifications, 0 auto-created offers.

## Tests

`tests/offer-flow.test.sql` is a rollback-safe integration test for the offer
lifecycle (accept transaction, competing-offer auto-decline, double-accept
rejection, sender-only cancel). Run it against a **local** database that has
files 1–3 applied:

```bash
psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/offer-flow.test.sql
```

After `car_catalog.sql`, run `node scripts/ingest-car-catalog.mjs` from the
project root with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set. The script
loads makes and models from the free NHTSA vPIC API and upserts them into
`public.car_makes` / `public.car_models`.

## Edge Functions

```bash
supabase functions deploy accept-offer
supabase functions deploy decline-offer
supabase functions deploy counter-offer
supabase functions deploy mark-offer-viewed
supabase functions deploy run-matching-for-vehicle
```

All offer functions forward the caller's JWT to a `SECURITY DEFINER` RPC:

- `accept-offer` → `accept_offer(offer_id)` → `{ conversation_id }`
- `decline-offer` → `decline_offer(offer_id)` → `{ declined: true }`
- `counter-offer` → `counter_offer(...)` → `{ counter_offer_id }`
- `mark-offer-viewed` → `mark_offer_viewed(offer_id)` → `{ viewed: bool }`
- `run-matching-for-vehicle` → `find_mutual_matches_for_vehicle(vehicle_id)`
  using the service-role key → `{ matches_created }`. Matching also runs
  automatically via triggers when desires/preferences change or a vehicle
  re-activates.

## Auth providers

Enable the **Email** provider in Supabase Auth — the app signs users in with a
6-digit email OTP (`front/login.html`). Recommended dashboard settings:

- Email OTP expiry: **300 seconds** (5 minutes).
- Keep the default OTP request rate limits (anti-spam).

Supabase stores only the hash of the code and issues JWT access + refresh
tokens; `supabase-js` rotates them automatically. Google/Apple/Phone can be
added later without app changes.

## Environment

The static frontend reads its keys from `front/supabase-config.js` (copy
`front/supabase-config.example.js` and fill in the project URL + anon key).

## What runs where

- **Direct Supabase queries (RLS-guarded):** public feed, listing creation,
  photo upload, desired vehicles, offer creation/rejection/cancellation,
  notifications, conversations, messages.
- **`SECURITY DEFINER` RPC / Edge Functions:** offer acceptance (atomic accept +
  conversation + notification) and explicit match runs.

See the project [`README.md`](../README.md) for the full architecture overview.
