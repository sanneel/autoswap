# AutoSwap Web

Next.js + Supabase web MVP for a peer-to-peer car swap marketplace.

## Stack

- Next.js / React
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime
- Vercel-ready deployment

No custom Node backend is required for the MVP.

## Run Locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add the Supabase project URL and anon key.

## Supabase

Run:

1. `supabase/schema.sql`
2. `supabase/policies.sql`

The app uses these primary objects:

- `profiles`
- `vehicles`
- `vehicle_photos`
- `desired_vehicles`
- `offers`
- `conversations`
- `messages`

## Product Flow

Guests can browse active vehicles. Signed-in users can create listings, upload up to six vehicle photos, send offers from one of their own vehicles, accept or reject incoming offers, and chat only after an offer is accepted.

Payments are intentionally left out of the first build. The schema includes `listing_boosts` for later Stripe-based boosts.
