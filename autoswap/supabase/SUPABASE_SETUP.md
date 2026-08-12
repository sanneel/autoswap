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
7. `verify_ge_auth.sql` (requestId↔phone binding + phone→user lookup)
8. `seed.sql`     (optional local demo data)

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

## 5. OTP delivery via verify.ge (SMS + WhatsApp)

The login code is delivered by [verify.ge](https://verify.ge), over SMS or
WhatsApp — the user picks on the login form and the choice is remembered.

### Why this replaces Supabase's own OTP

verify.ge is a *closed-loop* verifier: `POST /otp/send` mints the code and
returns a `requestId`, `POST /otp/verify` checks it. It never accepts a code
somebody else generated, and its send API has no message-body field.

Two consequences worth knowing before changing any of this:

- **It cannot be a "Send SMS" auth hook.** That hook hands you the code
  *Supabase* generated and expects you to deliver that exact string.
- **WebOTP autofill does not work on this provider.** `autofillOtpFromSms`
  needs the SMS to end with `@autoswap.ge #123456`, and nothing in the API can
  put it there — it would have to be set account-side by verify.ge. The code
  screen therefore skips WebOTP entirely on the WhatsApp channel, where it
  could never apply (WebOTP reads the SMS inbox only).

So Supabase Auth stops verifying the number, and `verify-otp` issues sessions
instead. `otp_rate_check` still runs first and is unchanged.

### Configure

Set on the Edge Function secrets (Dashboard → Edge Functions → Secrets, or
`supabase secrets set`):

| variable | required | notes |
| --- | --- | --- |
| `VERIFY_GE_API_KEY` | yes | enables this path; unset falls back to Supabase SMS |
| `VERIFY_GE_BASE_URL` | no | defaults to `https://api.verify.ge/api/v1` |
| `SHADOW_EMAIL_DOMAIN` | no | defaults to `phone.autoswap.ge` (see below) |

**Authentication → Providers → Email** must stay enabled. Phone does *not* need
to be — and cannot be: Supabase refuses to enable its phone provider without
Twilio Account SID, Auth Token, and Message Service SID, which is precisely what
moving to verify.ge avoids.

That is why the session is minted through the *email* provider. Each number gets
a shadow address (`p995XXXXXXXXX@phone.autoswap.ge`) that exists only to give
GoTrue a stable handle; **no mail is ever sent to it**, and `generateLink` only
generates. An account that already has a real address (Google sign-in) keeps it
and is minted against that instead.

Because the phone provider is off, `auth.users.phone` is written best-effort and
the number is always mirrored into `user_metadata.phone`. `user_id_for_phone`
matches either, and the frontend already falls back to the metadata copy.

```bash
supabase functions deploy request-otp && supabase functions deploy verify-otp
```

### How a login flows

1. `request-otp` rate-checks, calls verify.ge, and records the returned
   `requestId` against the phone in `public.otp_requests`.
2. The browser gets only the `requestId` — never the code.
3. `verify-otp` reads the phone **back from that row**, asks verify.ge to check
   the code, burns the row, then finds-or-creates the user and returns a
   single-use `token_hash`, which the browser redeems via
   `verifyOtp({ token_hash, type: 'magiclink' })` to create the session.

Step 3 is the security-critical one. The phone is deliberately never taken from
the request body: a caller could otherwise verify a code sent to their own
number and ask for a session belonging to somebody else's. Wrong codes cost an
attempt (6 per request) but do not burn the request, so a typo does not force a
fresh SMS.

### Open questions for verify.ge

Not answerable from their public docs, and each one affects this integration:

- WhatsApp per-message price and which tiers include it (the pricing page
  lists SMS only, though `OtpChannel.WHATSAPP` is live in their SDK).
- Whether `GET /otp/{requestId}` — which their SDK documents as a *public*
  endpoint returning the live `otpCode` — is disabled for production keys. If
  it is not, anyone holding a `requestId` can read the code.
- Whether the SMS body can be given the `@autoswap.ge #CODE` suffix
  account-side, which is the only way autofill comes back.
- Sender branding is Enterprise-only (59.9 GEL/mo); below that, codes arrive
  from a generic shortcode.

## Notes

- Photos resolve from `cover_photo_url`; listings without a photo fall back to a
  bundled image.
- The **save** and **შესთავაზე გაცვლა** (offer) buttons are visual for now —
  wiring them needs Supabase Auth + the offer flow (already built in the backend
  RPCs / Edge Functions).
