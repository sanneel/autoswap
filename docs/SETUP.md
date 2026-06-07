# Setup checklist

A condensed checklist to go from clone to a running app.

## 1. Tooling

- Flutter 3.22+ (`flutter --version`)
- Dart 3.4+
- Xcode 15 (iOS), Android Studio Hedgehog+ (Android), CocoaPods 1.14+

## 2. Supabase

- Create a project (free tier is fine for MVP)
- SQL editor → run `supabase/schema.sql`
- SQL editor → run `supabase/policies.sql`
- (Optional) `supabase/seed.sql` after creating matching `auth.users`
- Auth → Providers → enable Email
- Settings → API: copy `Project URL` + `anon` key

## 3. RevenueCat

- New app in RevenueCat
- iOS + Google Play products: `contact_unlock_lifetime` (non-consumable)
- Entitlement `contact_unlock` attached to the product
- One offering (`default`) containing the package
- Webhook → Supabase Edge Function that flips `profiles.contact_unlocked`

## 4. Firebase

- Console → add iOS + Android apps
- Download `GoogleService-Info.plist` → `ios/Runner/`
- Download `google-services.json` → `android/app/`
- Enable Cloud Messaging
- iOS: in Xcode, enable **Push Notifications** and **Background Modes → Remote notifications**

## 5. Local config

Run with `--dart-define` keys (see `README.md`). For development you can also use VS Code's `launch.json`:

```json
{
  "configurations": [
    {
      "name": "SwapRide (dev)",
      "request": "launch",
      "type": "dart",
      "toolArgs": [
        "--dart-define=SUPABASE_URL=https://YOUR.supabase.co",
        "--dart-define=SUPABASE_ANON_KEY=YOUR_ANON_KEY",
        "--dart-define=REVENUECAT_APPLE_KEY=appl_xxx",
        "--dart-define=REVENUECAT_GOOGLE_KEY=goog_xxx"
      ]
    }
  ]
}
```

## 6. First run

```bash
flutter pub get
flutter run --dart-define=...
```

Create an account → onboard profile → add a car → set swap preferences. Repeat with a second account on another simulator to exercise matching + chat.

## 7. Troubleshooting

| Symptom | Likely cause |
|---|---|
| "RevenueCat is not configured" on the paywall | API keys missing — check `--dart-define` |
| Chat sends fail with "Contact information…" | The contact filter caught a digit/URL pattern — paste plain text without phone-shaped sequences |
| Empty Discover feed | No other users with active cars; create a second test account |
| "Matches" page empty after two reciprocal "interested" swipes | Both users must have at least one matching entry in `desired_vehicles` for the other's car |
