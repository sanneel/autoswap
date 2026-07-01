# AutoSwap Web — Supabase wiring

This static frontend (`front/`) reads live listings from Supabase directly in the
browser, with a built-in demo fallback so the page always renders.

## How it's wired

`index.html` loads, in order:

1. `@supabase/supabase-js` (UMD, from jsDelivr) → `window.supabase`
2. `supabase-config.js` → your project URL + anon key
3. `shared.js` → creates the client and exposes feed/catalog helpers
4. page scripts (`app.js`, `cars.js`, `vehicle.js`) → render live data

`shared.js` queries the **`public_vehicle_feed`** view (active listings, boosted
first, newest next), maps each row to a listing card, and exposes catalog-backed
make/model search helpers. If Supabase is not configured or unreachable, the
demo listings and bundled make/model fallback are shown.

## 1. Configure browser keys

Edit `front/supabase-config.js`:

```js
window.AUTO_SWAP_SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
window.AUTO_SWAP_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

The anon key is safe in browser code because Row Level Security is enabled and
the feed view is `security_invoker` (guests can only read active listings).
Never paste a service-role key into `front/supabase-config.js`.

## 2. Run the database SQL

The schema, policies, functions, storage, and car catalog tables live in
[`./supabase`](./supabase). In the Supabase SQL editor run, in order:

1. `schema.sql`   (tables, indexes, triggers, the `public_vehicle_feed` view)
2. `functions.sql`
3. `policies.sql`
4. `storage.sql`
5. `car_catalog.sql` (make/model reference tables for contains search)
6. `otp_rate_limit.sql` (OTP throttle tables + `otp_rate_check` RPC)
7. `seed.sql`     (optional local demo data)

Then ingest the catalog from the project root:

```powershell
$env:SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
node scripts/ingest-car-catalog.mjs
```

## 3. What the feed reads

`public_vehicle_feed` exposes: `make, model, year, mileage, fuel_type, city,
category, condition, cover_photo_url, desired_vehicle_labels, cash_mode,
cash_amount, is_boosted, created_at`. The frontend maps `cash_mode`/`cash_amount`
to the Georgian cash labels (ამატებს / ითხოვს / თანხის გარეშე / შეთანხმებით).
The cars filter also reads `public.car_makes` and `public.car_models` for
contains search suggestions.

## 4. OTP rate limiting (login SMS abuse protection)

`otp_rate_limit.sql` (step 6 above) installs the throttle tables and
`public.otp_rate_check(ip, phone)`. The `request-otp` Edge Function calls it
before every SMS send, applying:

- **per-IP burst** — > 2 sends from one IP in 60s → block that IP 5 min;
- **per-phone bombing** — > 3 codes to one number in 10 min → block it 15 min;
- **distributed velocity** — ≥ 4 distinct IPs in 30s → 3-min global cooldown.

Deploy the function and keep Supabase's built-in auth rate limits on:

```bash
supabase functions deploy request-otp
```

### Optional: bypass-proof enforcement via a Send SMS hook

The Edge Function is the app's path, but the raw `/auth/v1/otp` endpoint is
reachable with the anon key. To enforce the limiter no matter how the OTP was
requested, register `otp_rate_check` inside Supabase's own send pipeline:

Dashboard → Authentication → **Hooks** → **Send SMS** → Postgres → point it at a
wrapper that calls `public.otp_rate_check(<ip>, <phone>)` and returns an error
payload (`{"error":{"http_code":429,"message":"…"}}`) when `allowed = false`,
otherwise dispatches the SMS via your provider. The Edge Function and the hook
share the same `otp_rate_check`, so the policy stays in one place.

## Notes

- Photos resolve from `cover_photo_url`; listings without a photo fall back to a
  bundled image.
- The **save** and **შესთავაზე გაცვლა** (offer) buttons are visual for now —
  wiring them needs Supabase Auth + the offer flow (already built in the backend
  RPCs / Edge Functions).
