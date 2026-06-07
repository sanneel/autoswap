# Supabase setup

1. Create a new Supabase project at https://supabase.com.
2. Open **SQL editor** and run, in order:
   - `schema.sql`
   - `policies.sql`
   - `seed.sql` *(optional — local dev only)*
3. In **Authentication → Providers**, enable **Email** (password). Disable email confirmations for dev if desired.
4. **Storage** buckets `avatars` and `car-photos` are created by `policies.sql`; both are public read.
5. **Realtime**: `messages` and `matches` tables are added to the `supabase_realtime` publication in `schema.sql`.
6. Copy **Project URL** and **anon key** into the Flutter app via `--dart-define`:

```
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=YOUR_ANON_KEY \
  --dart-define=REVENUECAT_APPLE_KEY=appl_xxx \
  --dart-define=REVENUECAT_GOOGLE_KEY=goog_xxx
```

## RevenueCat webhook → payments table

In RevenueCat, configure a webhook to a Supabase Edge Function (or your own server) that inserts into `public.payments` and updates `profiles.contact_unlocked = true` for the user. The client also flips the flag locally on a successful purchase so the UX is instant.

## Matching

Matching runs server-side via the `handle_swipe` trigger. On every "interested" swipe, the engine checks whether the other party also marked any of your cars "interested"; if so, it iterates each owner's cars and creates one match row per qualifying car pair, in canonical (lex-sorted) user order.
