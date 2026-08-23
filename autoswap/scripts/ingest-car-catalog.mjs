#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { slugify, normalizeMakeName, dedupeMakes, dedupeModels } from './lib/catalog-utils.mjs';

if (process.env.INGEST_CONFIRM_OVERWRITE !== '1' && !process.argv.includes('--dry-run')) {
  console.error([
    'ingest-car-catalog: refusing to run.',
    '  The live catalog comes from the myauto.ge list; this script loads NHTSA vPIC (US) data',
    '  and would upsert over car_makes / car_models, replacing it.',
    '  To overwrite deliberately:  INGEST_CONFIRM_OVERWRITE=1 node scripts/ingest-car-catalog.mjs',
    '  To inspect without writing: node scripts/ingest-car-catalog.mjs --dry-run',
  ].join('\n'),
  );
  process.exit(1);
}

const VPIC = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const MAKES_URL = `${VPIC}/GetMakesForVehicleType/car?format=json`;
const modelsURL = (makeId) => `${VPIC}/GetModelsForMakeId/${makeId}?format=json`;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const FETCH_CONCURRENCY = 6;
const UPSERT_CHUNK = 500;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const BLOCKLIST_PATH = path.join(SCRIPT_DIR, 'car-make-blocklist.json');

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

function readMakeBlocklist() {
  if (!fs.existsSync(BLOCKLIST_PATH)) return new Set();
  const names = JSON.parse(fs.readFileSync(BLOCKLIST_PATH, 'utf8'));
  if (!Array.isArray(names)) fail('car-make-blocklist.json must contain an array of make names.');
  return new Set(names.map(normalizeMakeName).filter(Boolean));
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  fail('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables first.');
}

const BLOCKED_MAKE_NAMES = readMakeBlocklist();

async function fetchJSON(url, attempt = 1) {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
      return fetchJSON(url, attempt + 1);
    }
    throw err;
  }
}

const DRY_RUN = process.argv.includes('--dry-run');

async function upsert(table, rows, onConflict) {
  if (DRY_RUN) {
    console.log(`  [dry-run] would upsert ${rows.length} row(s) into ${table} (no write performed)`);
    return;
  }
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK);
    const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const body = await res.text();
      fail(`Upsert into ${table} failed (HTTP ${res.status}): ${body}`);
    }
  }
}

async function pool(items, size, worker) {
  const results = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  console.log('→ Fetching car makes from vPIC…');
  if (BLOCKED_MAKE_NAMES.size) {
    console.log(`  ${BLOCKED_MAKE_NAMES.size} make names are blocklisted and will be skipped.`);
  }
  const makesJson = await fetchJSON(MAKES_URL);
  const makes = dedupeMakes(makesJson.Results, BLOCKED_MAKE_NAMES);
  console.log(`  ${makes.length} unique car makes.`);

  console.log('→ Upserting makes…');
  await upsert('car_makes', makes, 'id');

  console.log(`→ Fetching models for ${makes.length} makes (concurrency ${FETCH_CONCURRENCY})…`);
  let totalModels = 0;
  let done = 0;
  await pool(makes, FETCH_CONCURRENCY, async (make) => {
    const json = await fetchJSON(modelsURL(make.id));
    const models = dedupeModels(json.Results, make.id);

    if (models.length) {
      await upsert('car_models', models, 'make_id,name');
      totalModels += models.length;
    }

    done += 1;
    if (done % 25 === 0 || done === makes.length) {
      console.log(`  ${done}/${makes.length} makes · ${totalModels} models so far`);
    }
  });

  console.log(`\n✓ Done. ${makes.length} makes, ${totalModels} models ingested.\n`);
}

main().catch((err) => fail(err.message || String(err)));
