# AutoSwap — car swap marketplace

A Georgian car exchange marketplace: list your car, browse what others are
swapping, send structured swap offers (with optional cash adjustment), get
matched automatically, chat after an offer is accepted.

## Stack

| Layer      | Technology                                                            |
| ---------- | --------------------------------------------------------------------- |
| Database   | Supabase Postgres (tables, indexes, triggers, RPCs in `supabase/`)     |
| Auth       | Supabase Auth — **Google OAuth + phone SMS OTP** (6-digit code, JWT + refresh) |
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
6. `supabase/otp_rate_limit.sql`

### 2. Auth (Google OAuth + phone SMS OTP)

The phone number is the marketplace identity. Email auth is intentionally not
used. In the Supabase dashboard → Authentication:

- **Phone** provider: enable it and configure an SMS provider (Twilio, Vonage,
  MessageBird…). Set the **Phone OTP expiry** to `300` seconds (5 minutes).
- **Google** provider: enable it and add the deployed site URL to the allowed
  **redirect URLs** (OAuth users are prompted to attach a phone right after).
- **Keep Supabase's built-in auth rate limits enabled.** They are the hard
  backstop against the raw `/auth/v1/otp` endpoint (see "OTP rate limiting").

Supabase stores only the **hash** of the OTP, expires it, and issues the JWT
access + refresh token pair that `supabase-js` rotates automatically. The login
UI is `front/login.html`; the in-app modal lives in `front/shared.js`.

Until an SMS provider is configured the app runs a clearly-labelled **demo**
fallback (fixed code `1234`); demo sessions can browse but cannot write. Make
sure the provider is live before launch so real users never see it.

### 3. Edge Functions

Deploy the functions in `back/` (offer accept/decline/counter, matching, and
**`request-otp`**, the rate-limited OTP entry point):

```bash
supabase functions deploy request-otp
# …plus accept-offer, decline-offer, counter-offer, mark-offer-viewed,
#    run-matching-for-vehicle
```

`request-otp` uses the project's `SUPABASE_SERVICE_ROLE_KEY` (injected into
Edge Functions automatically) to call the limiter; nothing extra to configure.

### 4. Car catalog (brands/models)

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

### 5. Frontend

`front/supabase-config.js` (gitignored, environment-specific) holds the project
URL + **anon** key. Two ways to produce it:

- **Local dev:** copy `front/supabase-config.example.js` → `front/supabase-config.js`
  and fill it in by hand.
- **Deploy:** set `AUTO_SWAP_SUPABASE_URL` + `AUTO_SWAP_SUPABASE_ANON_KEY` as
  build env vars and let the build command generate it:

  ```bash
  node scripts/gen-config.mjs   # writes front/supabase-config.js from env
  ```

  `netlify.toml` wires this up (`build.command` + `publish = "front"`). Serve
  `front/` from any static host. Without the config file every page runs in demo
  mode.

## OTP rate limiting

Login SMS codes are rate limited **server-side**, because the browser holds only
the public anon key — a check living in client JS could simply be skipped. The
authority is `public.otp_rate_check()` (`supabase/otp_rate_limit.sql`), called by
the `request-otp` Edge Function before any SMS is dispatched:

| Rule | Trigger | Action |
| ---- | ------- | ------ |
| Per-IP burst | > 2 sends from one IP within 60s | block that IP for 5 min |
| Per-phone bombing | > 3 codes to one number within 10 min | block that number 15 min |
| Distributed velocity | ≥ 4 distinct IPs within 30s (IP-rotation) | global cooldown 3 min |

Thresholds are named constants at the top of `otp_rate_check`. The distributed
rule is a short, self-healing cooldown on purpose — a long global ban would be a
denial-of-service lever an attacker could trip deliberately.

**Bypass note.** The Edge Function path covers the app and is the policy + UX
layer, but a determined attacker could call `/auth/v1/otp` directly with the anon
key. Two defenses close that:

1. Keep Supabase's **built-in auth rate limits** enabled (hard backstop).
2. For bypass-proof enforcement, register `otp_rate_check()` as a Supabase
   **Send SMS** auth hook so it runs inside Supabase's own send pipeline
   regardless of how the OTP was requested (see `supabase/SUPABASE_SETUP.md`).

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
