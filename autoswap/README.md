# AutoSwap — car swap marketplace

A Georgian car exchange marketplace: list your car, browse what others are
swapping, send structured swap offers (with optional cash adjustment), get
matched automatically, chat after an offer is accepted.

## Stack

| Layer      | Technology                                                            |
| ---------- | --------------------------------------------------------------------- |
| Database   | Supabase Postgres (tables, indexes, triggers, RPCs in `supabase/`)     |
| Auth       | Supabase Auth — **email OTP** (6-digit one-time code, JWT + refresh)   |
| API        | PostgREST (RLS-guarded) + `SECURITY DEFINER` RPCs + Edge Functions (`back/`) |
| Storage    | Supabase Storage — public `vehicle-photos` bucket, owner-only writes   |
| Frontend   | Static, framework-free HTML/CSS/JS in `front/` (works in demo mode without a backend) |
| Caching    | Per-tab TTL cache in the browser (`sessionStorage`); see "Caching" below |

There is intentionally **no Node server** in production: the static frontend
talks to Supabase directly, and all invariants live in Postgres (RLS +
transactional RPCs), so they hold no matter what client connects.

## Project layout

```
autoswap/
├── front/        # static pages: index, cars, vehicle, sell, login, account
├── supabase/     # schema.sql → functions.sql → policies.sql → storage.sql → car_catalog.sql (+ seed)
│   └── tests/    # offer-flow.test.sql — integration test for the accept transaction
├── back/         # Supabase Edge Functions (accept/decline/counter offer, matching)
├── scripts/      # vPIC catalog ingest, CSV test-listing loader, browser smoke test
└── tests/        # node:test unit tests (catalog ingest helpers)
```

## Setup

### 1. Database

Run these in the Supabase SQL editor **in order** (all idempotent — re-running
upgrades existing deployments in place):

1. `supabase/schema.sql`
2. `supabase/functions.sql`
3. `supabase/policies.sql`
4. `supabase/storage.sql`
5. `supabase/car_catalog.sql`

### 2. Auth (OTP)

In the Supabase dashboard → Authentication:

- Enable the **Email** provider.
- Set **Email OTP expiry** to `300` seconds (5 minutes).
- Keep default rate limits (they throttle OTP spam per address/IP).

Supabase stores only the **hash** of the OTP, expires it, rate-limits requests,
and issues the JWT access + refresh token pair that `supabase-js` rotates
automatically. The login UI is `front/login.html`.

### 3. Car catalog (brands/models)

```bash
SUPABASE_URL="https://YOUR-PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
npm run ingest:catalog
```

Imports passenger-car makes + models from the free NHTSA vPIC API
(normalized, deduped, blocklist-aware — see `scripts/README.md`).
Curate the catalog with the service-role-only helpers:

```sql
select public.set_car_make_active(440, false);   -- hide a make (and its models)
select public.set_car_model_active(1234, true);  -- re-enable one model
```

Deactivated rows stay hidden from clients (RLS) and are never resurrected by
re-running the ingest.

### 4. Frontend

Copy `front/supabase-config.example.js` → `front/supabase-config.js` and fill
in the project URL + **anon** key (never the service-role key). Serve `front/`
from any static host. Without the config file, every page runs in demo mode.

## Environment variables

| Variable                    | Used by                  | Notes                          |
| --------------------------- | ------------------------ | ------------------------------ |
| `AUTO_SWAP_SUPABASE_URL`    | browser (`supabase-config.js`) | project API URL          |
| `AUTO_SWAP_SUPABASE_ANON_KEY` | browser                | public anon key only           |
| `SUPABASE_URL`              | `scripts/*.mjs`          | same project URL               |
| `SUPABASE_SERVICE_ROLE_KEY` | `scripts/*.mjs`          | secret — server-side only      |
| `LOCAL_DB_URL`              | `npm run test:db`        | local Postgres for SQL tests   |

## Key flows

- **Listings** — `front/sell.html` creates/edits a vehicle (brand/model
  suggestions from the catalog, validation, ≤6 photos ≤5MB each uploaded to
  Storage). Owners manage status (active/paused/deleted) from `account.html`.
- **Offers** — "შესთავაზე გაცვლა" on a listing opens the offer modal: pick one
  of your ACTIVE cars, cash mode/amount, message. Duplicate pending offers per
  listing pair are blocked by a partial unique index. Accepting runs the
  `accept_offer` RPC, which atomically locks both vehicles, marks them
  swapped (`completed`), auto-declines all competing open offers, opens the
  conversation, and bumps both owners' swap counters. Decline/cancel/counter
  run through their own RPCs; clients cannot forge offer states (RLS).
- **Matching** — owners describe wants (`desired_vehicles`); triggers run
  mutual matching and create `match_suggestions` + notifications.
- **Messaging** — one conversation per accepted offer; only participants can
  read/write (RLS); live updates via Supabase Realtime.
- **Favorites** — heart on any card; list under `account.html#favorites`.

## Caching

The hot read paths are cached per browser tab (`sessionStorage`, TTL):

| Key                      | TTL    | Invalidated by                       |
| ------------------------ | ------ | ------------------------------------ |
| `as:cache:makes:*`       | 10 min | catalog changes age out naturally    |
| `as:cache:models:*`      | 10 min | 〃                                    |
| `as:cache:feed:*`        | 60 s   | any listing create/update/status change (`bustListingCaches()`) |

OTP issuance/verification state lives inside Supabase Auth (hashed, expiring,
rate-limited) — the app never stores OTPs.

> Why no Redis? There is no server runtime in this architecture to host it —
> the static frontend queries Postgres directly through PostgREST. If a Node
> API layer is introduced later, move these caches (and the search-query cache)
> to Redis keyed the same way.

## Tests

```bash
npm test          # unit tests (catalog ingest helpers), node:test
npm run test:db   # offer lifecycle integration test against a local Postgres
npm run smoke     # headless-browser smoke test of all pages (needs playwright)
```

`supabase/tests/offer-flow.test.sql` covers the accept transaction: swap
completion, competing-offer auto-decline, double-accept rejection, sender-only
cancel — and rolls everything back.
