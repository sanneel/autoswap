# AutoSwap — security hardening & deploy checklist

This documents the fixes applied after the security review and what still needs
to be configured in the Supabase dashboard (things code can't set).

## Fixed in this repo

| Finding | Fix |
|---|---|
| **P0 Stored/reflected XSS** | All user-controlled listing fields (make, model, city, description, wants, photo URLs) are HTML-escaped before `innerHTML` in `app.js`, `cars.js`, `vehicle.js`. Numeric catalog filters are digit-sanitized from the URL. `account.js`/`shared.js` were already escaped. |
| **P0 Profile phone leak / trust forgery** | `profiles_select` is now own-row only; the raw phone never leaves the table. Public trust info comes from the `public_vehicle_feed` view, switched to **definer** rights so it still resolves owner name/verification without exposing profiles. `UPDATE` on `phone_verified, email_verified, completed_swaps_count, response_rate, last_active_at` is **revoked** from clients (written only by security-definer functions). |
| **P1 Offer status forge** | `offers_insert_sender` now requires `status = 'pending'` and `parent_offer_id is null`. |
| **P1 Reopen completed / moderated listings** | `trg_vehicles_guard_status` blocks owners from reopening `completed` swaps or editing `under_review` listings (service role exempt). |
| **P1 Matching abuse** | `find_mutual_matches_for_vehicle` execute revoked from clients; `run_matching_for_vehicle` now checks vehicle ownership. The `run-matching-for-vehicle` Edge Function requires a valid JWT and verifies ownership. |
| **P1 Offer spam** | `trg_offers_rate_limit` caps a sender at 30 offers/hour. |
| **P2 Storage limits** | `vehicle-photos` bucket enforces `file_size_limit` (5 MB) and `allowed_mime_types` (jpeg/png/webp) server-side. Client also compresses images before upload. |
| **P2 No CSP/SRI** | Strict CSP via `<meta>` on every page **and** as real headers (`front/_headers` + `netlify.toml`); the jsDelivr Supabase script now has an SRI `integrity` hash. |

Apply the SQL in this order (all idempotent):

```
schema.sql → functions.sql → policies.sql → storage.sql
telegram.sql   (optional, for Telegram notifications)
```

## Must configure in the Supabase dashboard (not in code)

- **OTP / auth rate limits** — Authentication → Rate Limits. The app relies on
  Supabase Auth's built-in phone-OTP throttling; the 60-second client resend
  timer is UX only and is bypassable. Set sensible per-hour OTP send limits
  here. (No third-party SMS provider is wired in this repo by design.)
- **Google OAuth** — Authentication → Providers → Google (client id/secret +
  redirect URLs) for the "Google-ით შესვლა" button.
- **`front/supabase-config.js`** — copy from `supabase-config.example.js` and
  fill the project URL + anon key (and, optionally, the Telegram bot username).

## Deploy (Netlify)

`netlify.toml` publishes `autoswap/front` and sets the security headers. No build
step. Point the site at your Supabase project via `supabase-config.js`.

## Not classic-SQL-injectable

The app uses Supabase query builders / RPC params and static SQL — no
string-built queries.
