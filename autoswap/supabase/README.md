# AutoSwap — Supabase setup

Run these SQL files in the Supabase SQL editor **in order**:

1. `schema.sql` — tables, indexes, core triggers (profile creation,
   `updated_at`), the `public_vehicle_feed` view, and Realtime publication.
2. `functions.sql` — mutual matching (`vehicle_matches_desire`,
   `find_mutual_matches_for_vehicle`), the atomic `accept_offer`, and
   notification triggers.
3. `policies.sql` — Row Level Security for every table.
4. `storage.sql` — the public `vehicle-photos` bucket and owner-only
   upload/delete policies.
5. `car_catalog.sql` — public-read `car_makes` and `car_models` tables with
   trigram indexes for fast contains search.
6. `seed.sql` — **local dev only**. Inserts two users and the canonical
   mutual-match test (Audi A7 ⇄ BMW 550i). Expects 1 match suggestion, 2
   notifications, 0 auto-created offers.

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

Enable Email (and optionally Google, Apple, Phone) in Supabase Auth.

## Environment

Create `.env.local` for the Next.js app from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## What runs where

- **Direct Supabase queries (RLS-guarded):** public feed, listing creation,
  photo upload, desired vehicles, offer creation/rejection/cancellation,
  notifications, conversations, messages.
- **`SECURITY DEFINER` RPC / Edge Functions:** offer acceptance (atomic accept +
  conversation + notification) and explicit match runs.

See [`../docs/BACKEND_ARCHITECTURE.md`](../docs/BACKEND_ARCHITECTURE.md) for the
full design.
