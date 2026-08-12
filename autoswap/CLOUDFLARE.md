# Deploying AutoSwap on Cloudflare Pages

The site is static files plus Supabase — there is no server to move. The only
things Pages needs are a build command, an output folder, and the two public
Supabase values the build inlines into `front/supabase-config.js`.

Netlify config is left in place (`netlify.toml`) so both hosts can run in
parallel during the cutover. Delete it once DNS has moved and settled.

## 1. Create the project

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
**Connect to Git** → pick the `autoswap` repository.

| setting | value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `front` |
| Root directory | `autoswap` |

`.node-version` pins Node 22, so the runtime is picked up automatically.

**Do not add a `wrangler.toml` to this project.** When Pages finds one it reads
the build configuration from the file instead of the dashboard, and the build
log then reports `Build environment variables: (none found)` — the dashboard
variables below are ignored and the build fails on the missing Supabase config.
Putting them in the file instead would mean committing the anon key, and this
repo deliberately gitignores `front/supabase-config.js` to keep environment
values out of version control. Dashboard-only is the arrangement that satisfies
both.

## 2. Environment variables

These are what the first build fails without. Set them in the project's
**Settings → Variables and secrets**, for **Production** *and* **Preview**:

| name | value |
| --- | --- |
| `AUTO_SWAP_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `AUTO_SWAP_SUPABASE_ANON_KEY` | the publishable (`sb_publishable_…`) key |

Both are public — the anon key is shipped to every browser by design — so
neither needs to be marked as a secret.

If either is missing the **build fails** rather than shipping a broken site:
`gen-config.mjs` exits non-zero and Pages reports the error. It also refuses a
`sb_secret_…` or service-role key outright, so a wrong paste here cannot leak a
privileged key into browser code — you will get a failed build instead.

Set them for Preview as well as Production, or preview deploys of pull
requests will fail on a missing variable.

## 3. Things that carry over unchanged

- **`front/_headers`** — Pages uses the same format as Netlify, so the CSP and
  the security headers apply with no edit.
- **Extensionless URLs** — `/cars` resolves to `cars.html` on Pages exactly as
  it did on Netlify, so the internal links and `nextTarget()` in `login.js`
  keep working. No `_redirects` file is needed.
- **Long-lived asset caching** — Pages sets its own immutable caching on
  hashed assets. This repo instead versions by hand with `?v=` query strings in
  the `<link>` and `<script>` tags, which works identically on either host.

  **Bump the `?v=` number whenever you change `styles.css` or a `.js` file**,
  or returning visitors keep the cached copy. It is the single easiest thing to
  forget here, and the failure is silent: the deploy succeeds and nothing
  appears to change.

## 4. Domain cutover

1. Deploy on the `*.pages.dev` URL first and check the site there.
2. Pages → **Custom domains** → add `autoswap.ge` and `www.autoswap.ge`.
3. Point the registrar's nameservers (or the `CNAME`/`A` records) at
   Cloudflare, following the exact records the dashboard shows.
4. Leave Netlify connected until DNS has propagated, then remove the domain
   there so the two are not both claiming it.

## 5. Supabase is unaffected

Auth, the database and the Edge Functions all live in Supabase and are reached
directly from the browser, so nothing about them changes with the host. The one
thing to check after the domain moves is the Supabase **Auth → URL
Configuration** allow-list, which must contain the final site URL for the
Google OAuth redirect to come back to the right place.
