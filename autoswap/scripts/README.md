# Scripts

## `ingest-car-catalog.mjs`

Loads all car **makes** and **models** into Supabase from the free
[NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/), powering the searchable
make/model filter on the cars page.

### 1. Create the tables (once)

Run [`../supabase/car_catalog.sql`](../supabase/car_catalog.sql) in the Supabase
SQL editor (or `psql`). It creates `public.car_makes` and `public.car_models`
with trigram indexes (fast `ILIKE`/contains search) and public-read RLS.

### 2. Run the ingest

Requires **Node 18+** (built-in `fetch`). No `npm install` needed.

The **service-role key** is required to write — it is a secret. **Never commit it
or expose it in the browser.** Only the anon key goes in `front/supabase-config.js`.

PowerShell (Windows):

```powershell
$env:SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."   # service_role, Settings → API
node scripts/ingest-car-catalog.mjs
```

bash / macOS / Linux:

```bash
SUPABASE_URL="https://YOUR-PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..." \
node scripts/ingest-car-catalog.mjs
```

It upserts (idempotent) — re-run anytime to refresh. Expect a few hundred makes
and several thousand models; the run takes ~1–2 minutes.

### Blocklisted makes

`car-make-blocklist.json` contains makes that should be skipped during future
ingests. To remove already-ingested blocklisted makes from Supabase, run
[`../supabase/remove-unwanted-car-makes.sql`](../supabase/remove-unwanted-car-makes.sql)
in the Supabase SQL editor. Deleting a make also deletes its models because
`car_models.make_id` cascades on delete.

### 3. Connect the front-end

Fill [`../front/supabase-config.js`](../front/supabase-config.js) with your
Project URL and **anon** (public) key. The filter then queries the live catalog;
until then it uses the bundled popular-brands fallback in `front/shared.js`.

## `upload-test-listings-from-csv.mjs`

Uploads 15 test listings from `C:/Users/pc/Downloads/100.csv` into the main
AutoSwap tables, using the CSV's remote photo URLs as `vehicle_photos` rows.

Before running it, the live Supabase project must have the base app schema:

1. `../supabase/schema.sql`
2. `../supabase/functions.sql`
3. `../supabase/policies.sql`
4. `../supabase/storage.sql`

PowerShell:

```powershell
$env:SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."   # service_role, never browser
node scripts/upload-test-listings-from-csv.mjs C:\Users\pc\Downloads\100.csv 15
```

The script creates/reuses `autoswap-test-loader@autoswap.test`, removes previous
test listings owned by that loader, then inserts fresh vehicles, photos, swap
preferences, and desired-vehicle labels.
