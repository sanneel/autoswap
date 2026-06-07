# AutoSwap Web Supabase Setup

Run these files in the Supabase SQL editor:

1. `schema.sql`
2. `policies.sql`

Then enable these auth providers in Supabase:

- Google
- Apple
- Phone

Create the `.env.local` file for the Next.js app from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The MVP uses direct Supabase queries for the public feed, listing creation, photo upload, offer creation, offer rejection, message loading, and message sending.

Offer acceptance runs through the Postgres RPC `public.accept_offer(offer_id_input uuid)` because it needs to update the offer, reject competing pending offers, and create the conversation in one backend transaction.
