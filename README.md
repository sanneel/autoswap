# SwapRide

A Flutter MVP for a peer-to-peer car-swap marketplace, with optional cash adjustments. Built for a solo founder: small surface, simple state model, batteries-included on the backend.

## Stack

- **Flutter** (latest stable) + **Dart 3**
- **Riverpod** for state management (`StateNotifier` + `Provider` / `StreamProvider`)
- **GoRouter** for navigation, including a single bottom-nav `ShellRoute`
- **Supabase** for Auth, Postgres, Storage, Realtime (chat + match streams)
- **RevenueCat** for the contact-unlock paywall
- **Firebase Cloud Messaging** for push notifications

## Architecture

Clean architecture, feature-first, repository pattern, DI via Riverpod.

```
lib/
├── main.dart                  – entrypoint
├── app.dart                   – MaterialApp.router
├── bootstrap.dart             – Supabase / Firebase / RevenueCat / FCM init
├── core/
│   ├── config/env.dart        – --dart-define values
│   ├── constants/             – AppConstants, CarData
│   ├── di/providers.dart      – all Riverpod providers (repositories, services)
│   ├── error/failures.dart    – sealed Failure hierarchy
│   ├── router/                – GoRouter + route table
│   ├── theme/                 – M3 light theme + tokens
│   ├── utils/                 – validators, formatters, contact_filter, Result
│   └── widgets/               – PrimaryButton, EmptyState, LoadingView
├── features/
│   ├── auth/                  – sign in / up / reset
│   ├── profile/               – onboarding + view + edit
│   ├── cars/                  – my cars, create/edit, photos, swap prefs
│   ├── home/                  – swipe-or-tap discovery feed
│   ├── matches/               – list of mutual interests (live)
│   ├── chat/                  – realtime chat with contact filtering
│   ├── paywall/               – RevenueCat contact-unlock
│   ├── reports/               – spam / fake / scam / abuse
│   └── shell/                 – bottom navigation shell
└── services/
    ├── revenuecat_service.dart
    └── notifications_service.dart
```

Each feature follows the same layout: `data/` (models + repository) and `presentation/` (controller + screens).

## Database

See [`supabase/schema.sql`](supabase/schema.sql), [`supabase/policies.sql`](supabase/policies.sql), and [`supabase/seed.sql`](supabase/seed.sql).

Highlights:
- All tables have row-level security; `cars`, `car_photos`, `desired_vehicles`, `vehicle_preferences` are publicly readable but writable only by the owner.
- `matches`, `messages` are restricted to the two users involved.
- Storage buckets `avatars` and `car-photos` are public-read, write-own.
- `swipes` trigger `handle_swipe()` which checks for reciprocal "interested" actions and inserts canonical (lex-ordered) match rows. Matching is fully server-side.
- A photo-count trigger enforces the 10-photo limit per car.
- `messages` and `matches` are added to the `supabase_realtime` publication for live updates.

## Setup

### 1. Backend

1. Create a Supabase project.
2. Run `supabase/schema.sql`, then `supabase/policies.sql` in the SQL editor.
3. Enable Email auth (Authentication → Providers).
4. In RevenueCat, create:
   - One offering with a single product **`contact_unlock_lifetime`** (non-consumable)
   - One entitlement **`contact_unlock`** attached to that product
   - Configure a webhook to a Supabase Edge Function (or any HTTPS endpoint with the service-role key) that:
     ```sql
     insert into public.payments (user_id, product_id, entitlement_id, amount_cents, currency, raw)
     values (...);
     update public.profiles set contact_unlocked = true where id = :user_id;
     ```

### 2. Mobile

```bash
# Flutter doctor
flutter --version          # >= 3.22 stable
flutter pub get

# iOS — install pods, set min iOS to 13.0
cd ios && pod install && cd ..

# Run with required env
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=YOUR_ANON_KEY \
  --dart-define=REVENUECAT_APPLE_KEY=appl_xxxxx \
  --dart-define=REVENUECAT_GOOGLE_KEY=goog_xxxxx \
  --dart-define=REVENUECAT_CONTACT_UNLOCK_ENTITLEMENT=contact_unlock
```

To build release:

```bash
flutter build apk      --dart-define=...
flutter build appbundle --dart-define=...
flutter build ipa      --dart-define=...
```

### 3. Firebase

1. Add iOS and Android apps in the Firebase console.
2. Drop `google-services.json` into `android/app/`.
3. Drop `GoogleService-Info.plist` into `ios/Runner/`.
4. Enable Cloud Messaging.

The app calls `FirebaseMessaging.getToken()` and stores it in `profiles.push_token`. Pushes are sent from your server (or a Supabase Edge Function) on new matches and new messages — that delivery code is intentionally out-of-scope for the MVP client and lives server-side.

## Feature notes

### Matching
A user "swipes" `interested` on a car. The DB trigger (`handle_swipe`) checks whether the car's owner had previously expressed `interested` in any car of the swiper. If so, it calls `try_create_matches_for_pair`, which enumerates every active car pair between the two users and inserts one match row per pair that mutually satisfies both users' `desired_vehicles`. Match rows are deduplicated via a `(user_a, user_b, car_a, car_b)` unique constraint with `user_a < user_b`.

### Contact protection
[`core/utils/contact_filter.dart`](lib/core/utils/contact_filter.dart) is the single source of truth. Patterns are deliberately broad (emails, URLs, phone-like digit runs, Insta / WhatsApp / Telegram / t.me references, `@` handles). The chat repository checks `containsContactInfo()` before sending and throws `ContactBlockedException`. The UI surfaces the standard copy:

> Contact information can only be shared after unlocking communication.

…and offers a one-tap path to the paywall.

### Paywall
[`PaywallRepository`](lib/features/paywall/data/paywall_repository.dart) treats `profiles.contact_unlocked` as the source of truth (consistent across devices) and falls back to RevenueCat's entitlement on first launch / restore. The webhook is responsible for flipping the DB flag for cross-device propagation.

### Reports
A single flat reports table. Spam / fake / scam / abuse are the only reasons exposed in the UI. Admin review is intentionally manual for the MVP.

## Build instructions (quick reference)

```bash
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
```

## What's intentionally not built

- Web build (Flutter web works but image_picker UX is desktop-flavored)
- Localization
- Admin/moderation app
- Push-send server (use a Supabase Edge Function with the FCM REST API)
- Multi-currency support beyond a default EUR label

These are all 1-2 day add-ons once the MVP is validated.
