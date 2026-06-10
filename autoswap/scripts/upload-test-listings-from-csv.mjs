#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DEFAULT_CSV = 'C:/Users/pc/Downloads/100.csv';
const DEFAULT_LIMIT = 15;
const TEST_EMAIL = 'autoswap-test-loader@autoswap.test';
const TEST_PASSWORD = crypto.randomBytes(18).toString('base64url');
const TEST_OWNER_NAME = 'AutoSwap Test Loader';

const SUPABASE_URL = process.env.SUPABASE_URL || readFrontendUrl();
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CSV_PATH = process.env.CSV_PATH || process.argv[2] || DEFAULT_CSV;
const LIMIT = Number(process.env.LIMIT || process.argv[3] || DEFAULT_LIMIT);

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

function readFrontendUrl() {
  try {
    const config = fs.readFileSync(path.resolve('front/supabase-config.js'), 'utf8');
    return /AUTO_SWAP_SUPABASE_URL\s*=\s*['"]([^'"]*)/.exec(config)?.[1] || '';
  } catch (_err) {
    return '';
  }
}

if (!SUPABASE_URL) fail('Set SUPABASE_URL or configure front/supabase-config.js first.');
if (!SERVICE_KEY) fail('Set SUPABASE_SERVICE_ROLE_KEY in this terminal first.');
if (!fs.existsSync(CSV_PATH)) fail(`CSV not found: ${CSV_PATH}`);

const authHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

const jsonHeaders = {
  ...authHeaders,
  'Content-Type': 'application/json',
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value !== '')) rows.push(row);
  }

  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, '').trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function normalizeFuel(value) {
  const v = String(value || '').toLowerCase();
  if (v.includes('დიზ')) return 'diesel';
  if (v.includes('ჰიბ')) return 'hybrid';
  if (v.includes('ელ')) return 'electric';
  if (v.includes('გაზ')) return 'lpg';
  return 'petrol';
}

function normalizeTransmission(value) {
  const v = String(value || '').toLowerCase();
  if (v.includes('მექ')) return 'manual';
  if (v.includes('ტიპ')) return 'tiptronic';
  if (v.includes('ვარი')) return 'variator';
  return 'automatic';
}

function normalizeCategory(value) {
  const v = String(value || '').toLowerCase();
  if (v.includes('ჯიპ')) return 'suv';
  if (v.includes('კუპ')) return 'coupe';
  if (v.includes('ჰეჩ')) return 'hatchback';
  if (v.includes('პიკ')) return 'pickup';
  if (v.includes('მინ')) return 'minivan';
  if (v.includes('უნივ')) return 'universal';
  if (v.includes('კროს')) return 'crossover';
  return 'sedan';
}

function compactWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function photoUrls(row) {
  return compactWhitespace(row.photos)
    .split(/\s+/)
    .filter((url) => /^https?:\/\//i.test(url))
    .slice(0, 6);
}

function csvRowsToListings(rows) {
  return rows
    .map((row) => ({ row, photos: photoUrls(row) }))
    .filter(({ row, photos }) => row.make && row.model && row.year && photos.length)
    .slice(0, LIMIT)
    .map(({ row, photos }) => {
      const price = row.price ? `${Number(row.price).toLocaleString('en-US')} ${row.currency || 'USD'}` : '';
      const marker = `[autoswap-csv-test:${row.id}]`;
      const descriptionParts = [
        marker,
        price ? `Source price: ${price}.` : '',
        row.engine_l ? `Engine: ${row.engine_l}L.` : '',
        row.color ? `Color: ${row.color}.` : '',
        row.drive ? `Drive: ${row.drive}.` : '',
        row.steering ? `Steering: ${row.steering}.` : '',
        row.listing_url ? `Source: ${row.listing_url}` : '',
        compactWhitespace(row.description),
      ].filter(Boolean);

      return {
        source_id: String(row.id),
        vehicle: {
          id: crypto.randomUUID(),
          make: compactWhitespace(row.make),
          model: compactWhitespace(row.model),
          year: Number(row.year),
          mileage: Math.max(0, Number(row.mileage_km) || 0),
          fuel_type: normalizeFuel(row.fuel),
          transmission: normalizeTransmission(row.gearbox),
          city: compactWhitespace(row.location) || 'თბილისი',
          category: normalizeCategory(row.body_type),
          condition: 'good',
          description: descriptionParts.join('\n'),
          listing_type: 'sell_or_swap',
          status: 'active',
        },
        photos,
      };
    });
}

async function request(pathname, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${pathname}`, options);
  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (_err) {
    body = text;
  }
  if (!response.ok) {
    const message = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`${options.method || 'GET'} ${pathname} failed (${response.status}): ${message}`);
  }
  return body;
}

async function rest(table, options = {}) {
  return request(`/rest/v1/${table}`, options);
}

async function assertSchemaReady() {
  try {
    await rest('public_vehicle_feed?select=id&limit=1', { headers: authHeaders });
    await rest('vehicles?select=id&limit=1', { headers: authHeaders });
    await rest('vehicle_photos?select=id&limit=1', { headers: authHeaders });
  } catch (err) {
    fail(`Base AutoSwap schema is not ready. Run supabase/schema.sql, supabase/functions.sql, supabase/policies.sql, and supabase/storage.sql in Supabase SQL Editor first.\n\n${err.message}`);
  }
}

async function ensureTestOwner() {
  const payload = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: TEST_OWNER_NAME },
  };

  try {
    const created = await request('/auth/v1/admin/users', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    return created.id;
  } catch (err) {
    const users = await request('/auth/v1/admin/users?per_page=1000', { headers: authHeaders });
    const match = (users.users || []).find((user) => String(user.email).toLowerCase() === TEST_EMAIL);
    if (!match) throw err;
    return match.id;
  }
}

async function deletePreviousTestVehicles(ownerId) {
  await rest(`vehicles?owner_id=eq.${ownerId}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders,
      Prefer: 'return=minimal',
    },
  });
}

async function insertRows(table, rows, onConflict = '') {
  if (!rows.length) return [];
  const suffix = onConflict ? `?on_conflict=${onConflict}` : '';
  return rest(`${table}${suffix}`, {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      Prefer: 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });
}

async function main() {
  await assertSchemaReady();

  const csvText = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCsv(csvText);
  const listings = csvRowsToListings(rows);
  if (listings.length < LIMIT) fail(`Only found ${listings.length} usable CSV rows with photos.`);

  const ownerId = await ensureTestOwner();
  await deletePreviousTestVehicles(ownerId);

  const vehicles = listings.map(({ vehicle }) => ({ ...vehicle, owner_id: ownerId }));
  await insertRows('vehicles', vehicles);

  await insertRows('swap_preferences', vehicles.map((vehicle) => ({
    vehicle_id: vehicle.id,
    cash_mode: 'flexible',
    cash_amount: 0,
    notes: 'CSV test listing',
  })));

  await insertRows('desired_vehicles', vehicles.map((vehicle) => ({
    vehicle_id: vehicle.id,
    label: 'ნებისმიერი ავტომობილი',
  })));

  const photos = listings.flatMap(({ vehicle, photos: urls }) =>
    urls.map((url, position) => ({
      vehicle_id: vehicle.id,
      url,
      position,
    })));
  await insertRows('vehicle_photos', photos);

  console.log(JSON.stringify({
    insertedVehicles: vehicles.length,
    insertedPhotos: photos.length,
    ownerEmail: TEST_EMAIL,
    preview: vehicles.slice(0, 5).map((vehicle) => `${vehicle.make} ${vehicle.model} ${vehicle.year}`),
  }, null, 2));
}

main().catch((err) => fail(err.message || String(err)));
