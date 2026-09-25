# Launch checklist

The code side is done. What is left needs dashboard access (Supabase,
Cloudflare, Google) or owner-written Georgian copy. Do it in this order: the
backup comes before the migration, and the migration comes before the deploy
that depends on it.

Check progress at any point, read-only and safe to run as often as you like:

```bash
node scripts/verify-production.mjs
```

It probes the live site and database with the public anon key, sends no SMS,
writes nothing, and prints every open item with its fix. Exit code 0 means no
blockers are left.

Done on 2026-09-25: database migrated with all eight files, schema reloaded and
the phone backfill run (step 2, after a JSON export of every table and the
old policies, views and functions to `F:\autoswap-backups\2026-09-25` on the
owner's machine); `request-otp` and `verify-otp` redeployed (step 3), Pages
output directory set to `dist` and the `www` redirect rule added (steps 5 and
6), Google OAuth app published (step 7; Supabase URL configuration was already
correct). Email routing and the Pro upgrade were deliberately left for later.

## 1. Backups before anything else

The project is on the Free plan (image transforms report "feature not enabled"),
which has no automatic backups. Supabase → Organization → Billing → **Pro**
turns on daily backups. Do this before step 2: the migration is tested, but a
live database should never be changed without a way back.

## 2. Bring the database up to date

Production was created from an early schema and only some later files were
applied. Measured on 2026-09-25: **any visitor can read every profile row**
(phone, telegram link code), the listings view is missing columns (the price
filter fails), and none of the account checks below exist.

In the Supabase SQL editor, run each file in full, in this order (all are
idempotent):

1. `supabase/schema.sql`
2. `supabase/functions.sql`
3. `supabase/policies.sql`
4. `supabase/storage.sql`
5. `supabase/car_catalog.sql`
6. `supabase/otp_rate_limit.sql`
7. `supabase/verify_ge_auth.sql`
8. `supabase/telegram.sql` (only if Telegram notifications are used)

Then:

```sql
notify pgrst, 'reload schema';
select * from public.backfill_verified_phones();   -- review the report, see SECURITY.md
```

This exact sequence was run against a database shaped like production (old
18-column view, `using (true)` profile policy) and applies cleanly, with the
security, offer-flow and OTP test suites passing afterwards.

## 3. Real SMS codes

Sign-in texts go through verify.ge. Without its key, sign-in now fails with
"service temporarily unavailable" instead of silently switching to the old
demo code `1234`.

```bash
supabase login
supabase secrets set VERIFY_GE_API_KEY=... --project-ref lffxjaqeqvabmpiqyyrz
npm run functions:stage
supabase functions deploy request-otp --project-ref lffxjaqeqvabmpiqyyrz
supabase functions deploy verify-otp --project-ref lffxjaqeqvabmpiqyyrz
```

Redeploying also ships the phone-squatting fix in `verify-otp` and the health
check `verify-production.mjs` uses to confirm the provider.

## 4. Remove the test data

The live listings and accounts are test data (listings with myauto.ge photos).
The script lists everything first and deletes nothing without `--apply`:

```bash
SUPABASE_SERVICE_ROLE_KEY=... node scripts/purge-test-data.mjs
SUPABASE_SERVICE_ROLE_KEY=... node scripts/purge-test-data.mjs --keep=you@gmail.com --apply
```

`--keep` takes emails, phone numbers or user ids; kept accounts keep their
listings. It refuses to apply if a `--keep` value matches no account. The
service-role key is in Supabase → Project Settings → API; never commit it.

## 5. Deploy the front end

- Cloudflare Pages → Settings → Build: build command `npm run build`, output
  directory **`dist`**. It currently serves `front/` unhashed while `_headers`
  caches JS and CSS for a year.
- Merge the launch branch; Pages deploys `main`.

## 6. Cloudflare

- **Email:** Cloudflare → Email → Email Routing → enable, and route
  `hello@autoswap.ge` to a real inbox. It adds the MX records; today the domain
  has none, so the contact address on the site bounces.
- **www:** Rules → Redirect Rules → when hostname equals `www.autoswap.ge`,
  301 to `https://autoswap.ge${path}` keeping the query string. Today www serves
  a second copy of the site whose sign-ins do not carry over.

## 7. Google sign-in

- Google Cloud Console → OAuth consent screen → **Publish app**. In Testing mode
  only listed test users can sign in (100 max).
- Supabase → Authentication → URL Configuration: Site URL
  `https://autoswap.ge`, and `https://autoswap.ge/**` in the redirect URLs.

## 8. Copy only the owner can write

- **Privacy policy and terms** (`front/privacy.html`, `front/terms.html`): name
  who operates the service and how to reach them. Georgia's personal data law
  expects both. The privacy policy should also mention the new error reports
  (page address, browser, and the signed-in account's id when there is one).
  Worth a review by a local lawyer.
- **Report a listing** (`front/vehicle.js`, `REPORT_COPY`): the button and
  its modal are built and write to the existing `reports` table. They stay
  hidden until `button` has text. Fill in every string: the button, the modal
  title, the reason label, one label per reason, the details label, the submit
  button, the success and failure messages, and the sign-in prompt. Review
  reports with:

  ```sql
  select r.created_at, r.reason, r.details, v.make, v.model, r.vehicle_id
    from public.reports r left join public.vehicles v on v.id = r.vehicle_id
   order by r.created_at desc;
  ```

## 9. Watching it after launch

- Front-end errors from visitors' browsers land in `public.client_errors`:

  ```sql
  select created_at, page, message from public.client_errors order by created_at desc limit 100;
  ```

- Add a free external uptime check (for example UptimeRobot) on
  `https://autoswap.ge/` so an outage pages you instead of a user.

## 10. Region: not worth moving

The project is in `eu-west-1` (Ireland). Each Supabase call takes about 140 ms
from Tbilisi, but the network round trip to AWS Ireland is only about 80 ms and
to Frankfurt about 67 ms, so most of the cost is not distance and a move would
save roughly 12 ms a request. The latency work in the front end (fewer round
trips, preconnect, prerendering) is where the time was.
