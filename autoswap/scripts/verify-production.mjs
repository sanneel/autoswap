#!/usr/bin/env node
// Read-only launch check against the live site and its Supabase project, using
// only what any visitor has: the public pages and the anon key. Nothing is
// written and no SMS is sent. Every row says what is wrong and where to fix it.
//
//   node scripts/verify-production.mjs
//
// The Supabase URL and anon key come from AUTO_SWAP_SUPABASE_URL /
// AUTO_SWAP_SUPABASE_ANON_KEY, else from front/supabase-config.js. SITE_URL
// defaults to https://autoswap.ge. Exit code 1 when any blocker fails.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = (process.env.SITE_URL || 'https://autoswap.ge').replace(/\/$/, '');

function supabaseConfig() {
  let url = process.env.AUTO_SWAP_SUPABASE_URL || '';
  let key = process.env.AUTO_SWAP_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    try {
      const text = readFileSync(resolve(here, '..', 'front', 'supabase-config.js'), 'utf8');
      url ||= (text.match(/AUTO_SWAP_SUPABASE_URL\s*=\s*['"]([^'"]+)/) || [])[1] || '';
      key ||= (text.match(/AUTO_SWAP_SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)/) || [])[1] || '';
    } catch { /* fall through to the error below */ }
  }
  if (!url || !key) {
    console.error('verify-production: set AUTO_SWAP_SUPABASE_URL and AUTO_SWAP_SUPABASE_ANON_KEY, or create front/supabase-config.js');
    process.exit(2);
  }
  return { url: url.replace(/\/$/, ''), key };
}

const { url: SB, key: ANON } = supabaseConfig();
const anonHeaders = { apikey: ANON, Authorization: `Bearer ${ANON}` };
const ZERO = '00000000-0000-0000-0000-000000000000';

async function get(url, options = {}) {
  try {
    const res = await fetch(url, { redirect: 'manual', ...options });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* not JSON */ }
    return { status: res.status, headers: res.headers, text, json };
  } catch (err) {
    return { status: 0, headers: new Headers(), text: String(err.message || err), json: null };
  }
}

// GET runs a PostgREST RPC in a read-only transaction, so probing a function
// this way can never write. 404 = not in the schema; 42501 = exists, denied.
async function rpcState(name, query) {
  const r = await get(`${SB}/rest/v1/rpc/${name}?${query}`, { headers: anonHeaders });
  if (r.status === 404) return 'missing';
  if (r.json && r.json.code === '42501') return 'denied';
  return `callable (${r.status}${r.json && r.json.code ? ` ${r.json.code}` : ''})`;
}

const results = [];
const check = (level, name, ok, detail, fix) => results.push({ level, name, ok, detail, fix });

// ---------------------------------------------------------------- database
{
  const r = await get(`${SB}/rest/v1/profiles?select=id&limit=5`, { headers: anonHeaders });
  const rows = Array.isArray(r.json) ? r.json.length : 0;
  check('blocker', 'Profiles are private', rows === 0,
    rows ? `an anonymous visitor can read ${rows}+ profile rows (phone, telegram_link_code)` : 'anon reads 0 rows',
    'Run the SQL files in SECURITY.md order in the Supabase SQL editor (policies.sql replaces the `using (true)` policy).');
}
{
  const r = await get(`${SB}/rest/v1/public_vehicle_feed?select=estimated_value,owner_name&limit=1`, { headers: anonHeaders });
  check('blocker', 'Listings view is current', r.status === 200,
    r.status === 200 ? 'feed exposes estimated_value and owner fields' : `feed query failed: ${r.json?.message || r.status}`,
    'Run supabase/schema.sql, then `notify pgrst, \'reload schema\';`.');
}
{
  const trusted = await rpcState('account_is_trusted', '');
  check('blocker', 'Listings need a trusted account', trusted === 'denied',
    `account_is_trusted() is ${trusted}`,
    'Run supabase/policies.sql (adds account_is_trusted and the vehicles/offers insert checks).');
  const squat = await rpcState('squatted_shadow_account', 'p_email=probe%40example.invalid');
  check('blocker', 'Shadow-email squatting guard', squat === 'denied',
    `squatted_shadow_account() is ${squat}`,
    'Run supabase/verify_ge_auth.sql, then redeploy verify-otp.');
  for (const [fn, q] of [['user_id_for_phone', 'p_phone=%2B995500000000'], ['otp_rate_check', 'p_ip=127.0.0.1&p_phone=%2B995500000000'], ['find_mutual_matches_for_vehicle', `p_vehicle_id=${ZERO}`]]) {
    const state = await rpcState(fn, q);
    check('blocker', `${fn} is not callable by visitors`, state === 'denied', `${fn}() is ${state}`,
      'Run the SQL files in SECURITY.md order.');
  }
}

// ------------------------------------------------------- auth and functions
{
  const r = await get(`${SB}/auth/v1/settings`, { headers: { apikey: ANON } });
  const ext = (r.json && r.json.external) || {};
  check('blocker', 'Google sign-in enabled', !!ext.google, ext.google ? 'enabled' : 'disabled',
    'Supabase → Authentication → Providers → Google.');
}
{
  const health = await get(`${SB}/functions/v1/request-otp`, { headers: anonHeaders });
  const provider = health.json && health.json.provider;
  check('blocker', 'SMS codes go through verify.ge', provider === 'verify_ge',
    provider ? `request-otp reports provider "${provider}"` : `request-otp health check returned ${health.status} (redeploy it to get the health check)`,
    'supabase secrets set VERIFY_GE_API_KEY=... then `npm run functions:stage && supabase functions deploy request-otp && supabase functions deploy verify-otp`.');
}
for (const fn of ['request-otp', 'verify-otp']) {
  const r = await get(`${SB}/functions/v1/${fn}`, {
    method: 'OPTIONS', headers: { Origin: SITE, 'Access-Control-Request-Method': 'POST' },
  });
  check('blocker', `Edge function ${fn} deployed`, r.status === 200, `OPTIONS → ${r.status}`,
    `npm run functions:stage && supabase functions deploy ${fn}`);
}

// ------------------------------------------------------------------- site
const home = await get(`${SITE}/`);
{
  const hashed = /(?:styles|shared)\.[0-9a-f]{10}\.(?:css|js)/.test(home.text);
  check('launch', 'Pages serves the hashed build (dist/)', hashed,
    hashed ? 'HTML references content-hashed assets' : 'HTML references unhashed files (styles.css?v=...)',
    'Cloudflare Pages → Settings → Build: build command `npm run build`, output directory `dist`.');
  const csp = home.headers.get('content-security-policy') || '';
  const current = csp && !csp.includes('cdn.jsdelivr.net') && csp.includes("'inline-speculation-rules'");
  check('launch', 'Latest front end deployed', current,
    current ? 'CSP matches the self-hosted build' : 'live CSP still allows cdn.jsdelivr.net (older deploy)',
    'Merge and deploy the branch with the latency and launch fixes.');
}
{
  const www = await get(SITE.replace('://', '://www.') + '/');
  const loc = www.headers.get('location') || '';
  const ok = [301, 308].includes(www.status) && loc.replace(/\/$/, '') === SITE;
  check('launch', 'www redirects to the apex domain', ok,
    ok ? `${www.status} → ${loc}` : `www answers ${www.status}${loc ? ` → ${loc}` : ' with its own copy of the site'}`,
    'Cloudflare → Rules → Redirect Rules: hostname equals www.autoswap.ge → 301 to https://autoswap.ge${path}, preserving the query string.');
}
{
  const host = new URL(SITE).hostname;
  const r = await get(`https://cloudflare-dns.com/dns-query?name=${host}&type=MX`, { headers: { accept: 'application/dns-json' } });
  const mx = ((r.json && r.json.Answer) || []).filter((a) => a.type === 15).map((a) => a.data);
  check('blocker', `${host} can receive email`, mx.length > 0,
    mx.length ? mx.join(', ') : 'no MX records, so hello@ bounces',
    'Cloudflare → Email → Email Routing: enable it and forward hello@ to a real inbox.');
}

// ------------------------------------------------------------ information
{
  const r = await get(`${SB}/rest/v1/public_vehicle_feed?select=id&limit=1`, { headers: { ...anonHeaders, Prefer: 'count=exact' } });
  const total = (r.headers.get('content-range') || '').split('/')[1] || '?';
  check('info', 'Active listings', true, `${total} live now; purge test data before launch (scripts/purge-test-data.mjs)`, '');
}
{
  // Storage answers 'object not found' before it checks the feature, so this has
  // to ask for a photo that exists.
  const feed = await get(`${SB}/rest/v1/public_vehicle_feed?select=cover_photo_url&cover_photo_url=not.is.null&limit=1`, { headers: anonHeaders });
  const photo = (Array.isArray(feed.json) && feed.json[0] && feed.json[0].cover_photo_url) || '';
  const r = photo ? await get(photo.replace('/object/public/', '/render/image/public/') + '?width=10') : { json: null };
  const free = !!(r.json && r.json.code === 'FeatureNotEnabled');
  check('info', 'Supabase plan', !free,
    free ? 'image transforms disabled: looks like the Free plan (no automatic backups)' : 'image transforms enabled (paid plan)',
    'Supabase → Organization → Billing: Pro includes daily backups.');
}

// ----------------------------------------------------------------- report
const mark = (r) => (r.ok ? '✓' : r.level === 'info' ? '·' : '✗');
let blockers = 0;
for (const level of ['blocker', 'launch', 'info']) {
  const rows = results.filter((r) => r.level === level);
  if (!rows.length) continue;
  console.log(`\n${{ blocker: 'Blockers', launch: 'Before launch', info: 'Information' }[level]}`);
  for (const r of rows) {
    console.log(`  ${mark(r)} ${r.name}: ${r.detail}`);
    if (!r.ok && r.fix) console.log(`      fix: ${r.fix}`);
    if (!r.ok && level === 'blocker') blockers += 1;
  }
}
console.log(blockers ? `\n${blockers} blocker(s) open.` : '\nNo blockers open.');
// exitCode, not exit(): Node on Windows aborts on process.exit() while fetch
// still holds a keep-alive socket.
process.exitCode = blockers ? 1 : 0;
