#!/usr/bin/env node
// Clear pre-launch test data: listings, their photos and the accounts that made
// them. Everything on the project before launch is test data (the listings use
// myauto.ge photos), so the default is to remove all of it except the accounts
// you name with --keep, along with whatever those accounts own.
//
// Dry run by default; nothing is deleted without --apply.
//
//   SUPABASE_SERVICE_ROLE_KEY=... node scripts/purge-test-data.mjs
//   SUPABASE_SERVICE_ROLE_KEY=... node scripts/purge-test-data.mjs --keep=you@gmail.com --apply
//
// --keep takes a comma-separated list of emails, phone numbers (+995...) or
// user ids. SUPABASE_URL defaults to the one in front/supabase-config.js.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const BUCKET = 'vehicle-photos';

// Before any request is made, exiting outright is fine.
function die(message) {
  console.error(`purge-test-data: ${message}`);
  process.exit(1);
}

// Once requests are in flight, errors unwind to main() instead: Node on Windows
// aborts on process.exit() while fetch still holds a keep-alive socket.
function fail(message) {
  throw new Error(message);
}

function frontendUrl() {
  try {
    const config = readFileSync(resolve(here, '..', 'front', 'supabase-config.js'), 'utf8');
    return /AUTO_SWAP_SUPABASE_URL\s*=\s*['"]([^'"]*)/.exec(config)?.[1] || '';
  } catch {
    return '';
  }
}

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const keepArg = (args.find((a) => a.startsWith('--keep=')) || '').slice('--keep='.length);
const KEEP = keepArg.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

const SUPABASE_URL = (process.env.SUPABASE_URL || frontendUrl()).replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SUPABASE_URL) die('set SUPABASE_URL or configure front/supabase-config.js first.');
if (!SERVICE_KEY) die('set SUPABASE_SERVICE_ROLE_KEY in this terminal first (Supabase → Project Settings → API).');

const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

async function call(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) fail(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function allUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const data = await call('GET', `/auth/v1/admin/users?page=${page}&per_page=200`);
    const batch = (data && data.users) || [];
    users.push(...batch);
    if (batch.length < 200) return users;
  }
}

async function listStorage(prefix) {
  const entries = [];
  for (let offset = 0; ; offset += 1000) {
    const batch = await call('POST', `/storage/v1/object/list/${BUCKET}`, { prefix, limit: 1000, offset });
    entries.push(...(batch || []));
    if (!batch || batch.length < 1000) return entries;
  }
}

const normPhone = (p) => String(p || '').replace(/\D/g, '');
const matches = (u, k) => k === u.id
  || k === String(u.email || '').toLowerCase()
  || (normPhone(k) !== '' && normPhone(k) === normPhone(u.phone || u.app_metadata?.verified_phone));
const kept = (u) => KEEP.some((k) => matches(u, k));

async function main() {
  const users = await allUsers();
  const vehicles = await call('GET', '/rest/v1/vehicles?select=id,owner_id,make,model,year,status,created_at&order=created_at');
  const keepIds = new Set(users.filter(kept).map((u) => u.id));
  const unmatched = KEEP.filter((k) => !users.some((u) => matches(u, k)));

  const doomedVehicles = vehicles.filter((v) => !keepIds.has(v.owner_id));
  const doomedUsers = users.filter((u) => !keepIds.has(u.id));
  const keptVehicleIds = new Set(vehicles.filter((v) => keepIds.has(v.owner_id)).map((v) => v.id));

  // Photo folders are vehicles/<vehicle id>/. Folders whose listing is already
  // gone (an abandoned upload) are swept too, unless they belong to a kept listing.
  const folders = (await listStorage('vehicles')).filter((e) => e.id === null).map((e) => e.name);
  const doomedFolders = folders.filter((id) => !keptVehicleIds.has(id));

  const who = (u) => [u.email, u.phone ? `+${normPhone(u.phone)}` : u.app_metadata?.verified_phone].filter(Boolean).join(' / ') || u.id;
  const ownerOf = new Map(users.map((u) => [u.id, who(u)]));

  console.log(`Project: ${SUPABASE_URL}`);
  console.log(`\nAccounts: ${users.length} (keeping ${keepIds.size})`);
  for (const u of users) {
    const providers = (u.app_metadata?.providers || [u.app_metadata?.provider]).filter(Boolean).join('+');
    console.log(`  ${keepIds.has(u.id) ? 'keep  ' : 'delete'}  ${who(u)}  [${providers || 'no provider'}]  created ${String(u.created_at).slice(0, 10)}`);
  }
  console.log(`\nListings: ${vehicles.length} (deleting ${doomedVehicles.length})`);
  for (const v of vehicles) {
    console.log(`  ${keepIds.has(v.owner_id) ? 'keep  ' : 'delete'}  ${v.make} ${v.model} ${v.year || ''} [${v.status}]  owner ${ownerOf.get(v.owner_id) || v.owner_id}`);
  }
  console.log(`\nPhoto folders: ${folders.length} (deleting ${doomedFolders.length})`);
  if (unmatched.length) {
    console.log(`\nWARNING: --keep matched no account for: ${unmatched.join(', ')}. Check the spelling before --apply.`);
  }

  if (!APPLY) {
    console.log('\nDry run: nothing was deleted. Re-run with --apply to delete the rows marked "delete".');
    return;
  }
  if (unmatched.length) fail('refusing to --apply while a --keep value matches no account.');

  for (const folder of doomedFolders) {
    const files = (await listStorage(`vehicles/${folder}`)).filter((e) => e.id !== null);
    if (files.length) await call('DELETE', `/storage/v1/object/${BUCKET}`, { prefixes: files.map((f) => `vehicles/${folder}/${f.name}`) });
  }
  console.log(`deleted photos in ${doomedFolders.length} folder(s)`);

  for (let i = 0; i < doomedVehicles.length; i += 100) {
    const ids = doomedVehicles.slice(i, i + 100).map((v) => v.id);
    await call('DELETE', `/rest/v1/vehicles?id=in.(${ids.join(',')})`);
  }
  console.log(`deleted ${doomedVehicles.length} listing(s) (offers, photos rows and preferences cascade)`);

  for (const u of doomedUsers) await call('DELETE', `/auth/v1/admin/users/${u.id}`);
  console.log(`deleted ${doomedUsers.length} account(s) (profiles and everything they owned cascade)`);
}

try {
  await main();
} catch (err) {
  console.error(`purge-test-data: ${err.message}`);
  process.exitCode = 1;
}
