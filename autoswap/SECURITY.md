# AutoSwap - security hardening & deploy checklist

This documents the fixes applied after the security review and what still needs
to be configured in the Supabase dashboard (things code can't set).

## Fixed in this repo

| Finding | Fix |
|---|---|
| **P0 Stored/reflected XSS** | All user-controlled listing fields (make, model, city, description, wants, photo URLs) are HTML-escaped before `innerHTML` in `app.js`, `cars.js`, `vehicle.js`. Numeric catalog filters are digit-sanitized from the URL. `account.js`/`shared.js` were already escaped. |
| **P0 Profile phone leak / trust forgery** | `profiles_select` is now own-row only; the raw phone never leaves the table. Public trust info comes from the `public_vehicle_feed` view, switched to **definer** rights so it still resolves owner name/verification without exposing profiles. The trust columns (`phone_verified, email_verified, completed_swaps_count, response_rate, last_active_at`) are frozen against client writes by the `profiles_guard_trust` trigger — see the follow-up section below for why the column `REVOKE` alone was insufficient. |
| **P1 Offer status forge** | `offers_insert_sender` now requires `status = 'pending'` and `parent_offer_id is null`. |
| **P1 Reopen completed / moderated listings** | `trg_vehicles_guard_status` blocks owners from reopening `completed` swaps or editing `under_review` listings (service role exempt). |
| **P1 Matching abuse** | `find_mutual_matches_for_vehicle` execute revoked from clients; `run_matching_for_vehicle` now checks vehicle ownership. The `run-matching-for-vehicle` Edge Function requires a valid JWT and verifies ownership. |
| **P1 Offer spam** | `trg_offers_rate_limit` caps a sender at 30 offers/hour. |
| **P2 Storage limits** | `vehicle-photos` bucket enforces `file_size_limit` (5 MB) and `allowed_mime_types` (jpeg/png/webp) server-side. Client also compresses images before upload. |
| **P2 No CSP/SRI** | Strict CSP via `<meta>` on every page **and** as real headers (`front/_headers` + `netlify.toml`); the jsDelivr Supabase script now has an SRI `integrity` hash. |

## Follow-up hardening (second review pass)

A second audit found that two of the original "fixed" items did not actually hold,
plus one edge-function auth bug and one operational footgun. All four are fixed and
covered by SQL regression tests.

| Finding | Fix |
|---|---|
| **P0 Trust-column forgery — the `REVOKE UPDATE(col)` was a no-op** | Column-level `REVOKE UPDATE (phone_verified, …)` does **nothing** while the role also holds table-level `UPDATE` (which Supabase grants `authenticated`/`anon` by default): a table-wide grant already covers every column, so the column revoke cannot subtract from it. Reproduced on Postgres 16 — an authenticated user could set their own `phone_verified = true` and `completed_swaps_count = 999`. Real fix: `profiles_guard_trust`, a `BEFORE UPDATE` trigger (kept `SECURITY INVOKER` so it sees the caller's role) that resets the trust columns to their old values for direct client writes (`current_user in ('authenticated','anon')`) while letting `SECURITY DEFINER` RPCs — e.g. `accept_offer` bumping the swap counter — through untouched. The column `REVOKE` is retained as defense-in-depth. |
| **P1 Phone-login account confusion / hijack** | `user_id_for_phone()` resolved a login by matching **either** the GoTrue-verified `auth.users.phone` column **or** the client-writable `raw_user_meta_data->>'phone'`, `order by created_at limit 1`. An attacker who set their own metadata phone (via `auth.updateUser`) to a victim's number and held an older account captured that victim's sign-in. Fix: resolution now prefers a verified phone-column match (`order by coalesce(phone in (…), false) desc, created_at`), so a real verified account always beats a forged-metadata one; the metadata clause is kept only as a fallback for legacy accounts whose number lives solely in metadata. |
| **P2 Unbounded `vehicle_photos.url` → off-platform image beacon** | Listing photo URLs are client-inserted free text and render in the public feed; with `img-src https:` any owner could point a "photo" at an external tracking pixel to beacon viewers' IPs or host moderation-bypassing images. Fix: CSP `img-src` tightened from `https:` to `'self' data: blob: https://*.supabase.co` on every page and in `_headers` (all legitimate images are self-hosted assets or Supabase Storage; avatars render as initials, not remote images). |
| **P1 `ingest-car-catalog.mjs --dry-run` still wrote** | The advertised "inspect without writing" flag only let the script *start*; `main()` still upserted `car_makes`/`car_models`, destroying the curated live catalog. Fix: `--dry-run` now short-circuits every `upsert()` and logs what it *would* write. |

Known, accepted residuals (documented, not code-fixable here): the OTP rate limiter
trusts the left-most `X-Forwarded-For` hop (spoofable — the built-in Supabase auth
limits remain the hard backstop, and the distributed rule is deliberately a short
self-healing cooldown); wildcard CORS on the edge functions is inert because auth is
bearer-token, not cookie-based (no `Allow-Credentials`).

Apply the SQL in this order (all idempotent):

```
schema.sql → functions.sql → policies.sql → storage.sql
telegram.sql   (optional, for Telegram notifications)
```

## Must configure in the Supabase dashboard (not in code)

- **OTP / auth rate limits** - Authentication → Rate Limits. The app relies on
  Supabase Auth's built-in phone-OTP throttling; the 60-second client resend
  timer is UX only and is bypassable. Set sensible per-hour OTP send limits
  here. (No third-party SMS provider is wired in this repo by design.)
- **Google OAuth** - Authentication → Providers → Google (client id/secret +
  redirect URLs) for the "Google-ით შესვლა" button.
- **`front/supabase-config.js`** - copy from `supabase-config.example.js` and
  fill the project URL + anon key (and, optionally, the Telegram bot username).

## Deploy (Netlify)

`netlify.toml` publishes `autoswap/front` and sets the security headers. No build
step. Point the site at your Supabase project via `supabase-config.js`.

## Not classic-SQL-injectable

The app uses Supabase query builders / RPC params and static SQL - no
string-built queries.
