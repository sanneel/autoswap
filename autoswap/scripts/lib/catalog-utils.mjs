/* ===================================================================
   catalog-utils.mjs — pure helpers for the vPIC catalog ingest.
   Extracted from ingest-car-catalog.mjs so they are unit-testable
   (see tests/catalog-utils.test.mjs).
=================================================================== */

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeMakeName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .toUpperCase();
}

// vPIC repeats a make per vehicle type — keep the first row per MakeId,
// drop blocklisted names, and produce upsert-ready rows.
export function dedupeMakes(rawMakes, blockedNames = new Set()) {
  const makeById = new Map();
  for (const m of Array.isArray(rawMakes) ? rawMakes : []) {
    if (!m || !m.MakeId || !m.MakeName || makeById.has(m.MakeId)) continue;
    const name = String(m.MakeName).trim();
    if (blockedNames.has(normalizeMakeName(name))) continue;
    makeById.set(m.MakeId, { id: m.MakeId, name, slug: slugify(name) });
  }
  return [...makeById.values()];
}

// Case-insensitive dedupe of model names within one make.
export function dedupeModels(results, makeId) {
  const seen = new Set();
  const models = [];
  for (const r of Array.isArray(results) ? results : []) {
    const name = r && r.Model_Name ? String(r.Model_Name).trim() : '';
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    models.push({ make_id: makeId, name, slug: slugify(name) });
  }
  return models;
}
