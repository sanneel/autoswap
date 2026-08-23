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

A second audit found that three of the original "fixed" items did not actually
hold (two of them for the same reason - a column-level `REVOKE UPDATE` that
Postgres ignores whenever the role also has table-level `UPDATE`), plus one
edge-function auth bug and one operational footgun. All are fixed and covered by
SQL regression tests (`npm run test:db:security`).

| Finding | Fix |
|---|---|
| **P0 Trust-column forgery — the `REVOKE UPDATE(col)` was a no-op** | Column-level `REVOKE UPDATE (phone_verified, …)` does **nothing** while the role also holds table-level `UPDATE` (which Supabase grants `authenticated`/`anon` by default): a table-wide grant already covers every column, so the column revoke cannot subtract from it. Reproduced on Postgres 16 — an authenticated user could set their own `phone_verified = true` and `completed_swaps_count = 999`. Real fix: `profiles_guard_trust`, a `BEFORE UPDATE` trigger (kept `SECURITY INVOKER` so it sees the caller's role) that resets the trust columns to their old values for direct client writes (`current_user in ('authenticated','anon')`) while letting `SECURITY DEFINER` RPCs — e.g. `accept_offer` bumping the swap counter — through untouched. The column `REVOKE` is retained as defense-in-depth. |
| **P1 Phone-login account confusion / hijack** | `user_id_for_phone()` resolved a login by matching **either** the GoTrue-verified `auth.users.phone` column **or** the client-writable `raw_user_meta_data->>'phone'`, `order by created_at limit 1`. Any signed-in user can write that field with `auth.updateUser({data:{phone}})`, so an attacker who claimed a victim's number captured that victim's sign-in: with an older account they won the ordering, and against a victim who had no account yet they were the *only* match, so the victim's first genuine OTP funnelled them straight into the attacker's account. Fix: resolution now reads **only service-role-writable sources** - the verified phone column and `raw_app_meta_data->>'verified_phone'`, which the `verify-otp` function stamps after a proven OTP (`user_metadata` is never consulted, and the self-asserted phone is no longer written there on account creation). Legacy accounts whose number lived only in `user_metadata` are migrated by `backfill_verified_phones()` - see below. |
| **P2 Unbounded `vehicle_photos.url` → off-platform image beacon** | Listing photo URLs are client-inserted free text and render in the public feed; with `img-src https:` any owner could point a "photo" at an external tracking pixel to beacon viewers' IPs or host moderation-bypassing images. Fix: CSP `img-src` tightened from `https:` to `'self' data: blob: https://*.supabase.co` on every page and in `_headers` (all legitimate images are self-hosted assets or Supabase Storage; avatars render as initials, not remote images). |
| **P2 `telegram_chat_id` client-writable — same ineffective column `REVOKE`** | `telegram.sql` protected the column with `revoke update (telegram_chat_id)`, a no-op for the same reason as the P0 above. Only the bot ever sets it, after the user proves ownership by sending their link code to it — but a client could point their own profile at any chat id, skipping that check and pushing their notifications into a stranger's Telegram. Fix: a `profiles_guard_telegram` trigger freezes the column for direct client writes while the bot (service role) still sets it. It lives in `telegram.sql` rather than the shared profiles guard because that file is optional — a deployment without it has no such column, and a trigger referencing a missing field would break every profile update. `telegram_link_code` stays client-writable; the client generates it. |
| **P1 `ingest-car-catalog.mjs --dry-run` still wrote** | The advertised "inspect without writing" flag only let the script *start*; `main()` still upserted `car_makes`/`car_models`, destroying the curated live catalog. Fix: `--dry-run` now short-circuits every `upsert()` and logs what it *would* write. |

## Third pass (the residuals above, now closed)

| Finding | Fix |
|---|---|
| **P2 Rate limiter keyed on a spoofable IP → per-IP bypass + global OTP outage** | `clientIp()` read the **left-most** `X-Forwarded-For` entry — the one the caller writes — and only consulted `x-real-ip` when `X-Forwarded-For` was absent, so merely sending the header shadowed the trustworthy value. One machine could reset its own bucket and, worse, invent the 4 "distinct IPs" that trip the distributed rule, whose block is **global**: a DoS lever. Fix: a shared `back/_shared/client-ip.ts` prefers headers a proxy *overwrites* (`cf-connecting-ip`, `true-client-ip`, `x-real-ip`, `fly-client-ip`) and only then falls back to `X-Forwarded-For`, counted **from the right** (`TRUSTED_PROXY_HOPS`, default 1). When nothing trustworthy is found it returns `null`, so `otp_rate_check` skips the IP-keyed rules rather than enforcing them on attacker-chosen data — the per-phone rule keys on the number being texted and still holds. |
| **P2 The distributed rule was itself the DoS lever** | It tripped a global cooldown on *distinct IPs alone*. It now also requires several distinct **numbers** to be under fire (`c_glob_min_ph`), which is what a real rotation attack looks like — and each of those numbers is independently capped by the per-phone rule, so the bar cannot be met cheaply. A flood at a single number is blocked by phone scope and no longer denies sign-in to everyone else; regression-tested both ways. |
| **P3 Wildcard CORS on the SMS-spending endpoints** | Inert on the five JWT-authenticated functions (bearer auth, no `Allow-Credentials`), but `request-otp`/`verify-otp` are callable without a JWT and cost real money, so any page could pump OTPs at a number through a visitor's browser. Those two now reflect only allow-listed origins (`ALLOWED_ORIGINS`, default `autoswap.ge` + `www`, plus localhost for development). The other five are unchanged. |
| **P3 SMS provider errors echoed to the caller** | `request-otp` returned the provider's raw message, error code and HTTP status on a 502. Now logged server-side and answered with a generic message. |
| **P3 Webhook secret compared with `!==`** | `telegram-bot` now uses a constant-time comparison. |
| **P3 `vehicle_matches_desire` was a matching oracle** | `SECURITY DEFINER` and granted to `authenticated`, so any client could ask "does A match B?" for rows RLS hides. No client calls it — execute is now revoked from clients; `find_mutual_matches_for_vehicle` (also definer) still uses it. |
| **P3 Escapers missed `'` and `` ` `` ** | Not exploitable today (every attribute is double-quoted), but one refactor away from being so. `escapeAttr`/`escapeHtml` now cover both. `optionTags()` escapes its value and label, `statusBadge()` escapes an unmapped status, and the dead `selectField()` was deleted. |

Remaining accepted residual: the Supabase session lives in `localStorage` (the
library default — moving it would end "stay signed in"), and `script-src` still
allows `cdn.jsdelivr.net` for supabase-js, pinned with an SRI hash.

### Required migration step (phone-login accounts)

`verify_ge_auth.sql` stops resolving logins from `user_metadata`. Accounts created
by the old `verify-otp` retry fallback carry their number **only** there and would
become unreachable, so immediately after applying that file run:

```sql
select * from public.backfill_verified_phones();
```

It promotes each **uncontested** legacy claim into service-role-only
`app_metadata.verified_phone` and returns a report. It is idempotent and safe to
re-run. Rows reported as `skipped_claimed_by_verified` (a verified account already
owns that number) or `skipped_ambiguous` (several accounts claim it) are left for
an operator to resolve by hand rather than being silently trusted. A claim that was
already forged before the migration cannot be told apart from a genuine one, so run
this promptly and review the report; it does not make such a claim any stronger
than it is today, it only stops new forgeries from counting.

Apply the SQL in this order (all idempotent):

```
schema.sql → functions.sql → policies.sql → storage.sql
verify_ge_auth.sql  → then run backfill_verified_phones() (see above)
telegram.sql   (optional, for Telegram notifications)
```

## Edge Function environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | `request-otp`, `verify-otp` | Comma-separated browser origins allowed to call the OTP endpoints. Defaults to `https://autoswap.ge,https://www.autoswap.ge` (localhost is always allowed). **Set this for preview deployments** — a `*.pages.dev` URL is not allowed by default and its OTP calls will be blocked by the browser. |
| `TRUSTED_PROXY_HOPS` | `request-otp`, `verify-otp` | How many proxies in front of the function append to `X-Forwarded-For`. Default `1` (trust the right-most entry). Only needs changing if extra proxies are put in front of Supabase; getting it wrong makes the limiter key on the wrong address. |

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
