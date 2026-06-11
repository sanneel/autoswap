import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify, normalizeMakeName, dedupeMakes, dedupeModels,
} from '../scripts/lib/catalog-utils.mjs';

test('slugify normalizes display names', () => {
  assert.equal(slugify('Mercedes-Benz'), 'mercedes-benz');
  assert.equal(slugify('  ALFA ROMEO  '), 'alfa-romeo');
  assert.equal(slugify('Citroën'), 'citroe-n');
  assert.equal(slugify('Model 3'), 'model-3');
  assert.equal(slugify('---'), '');
});

test('normalizeMakeName collapses whitespace, trailing dot, case', () => {
  assert.equal(normalizeMakeName('  Gen.  Motors corp.'), 'GEN. MOTORS CORP');
  assert.equal(normalizeMakeName('bmw'), 'BMW');
  assert.equal(normalizeMakeName(null), '');
});

test('dedupeMakes keeps first row per MakeId and applies the blocklist', () => {
  const raw = [
    { MakeId: 1, MakeName: 'BMW' },
    { MakeId: 1, MakeName: 'BMW' },          // duplicate per vehicle type
    { MakeId: 2, MakeName: 'SpamTrucks Inc.' },
    { MakeId: 3, MakeName: ' Audi ' },
    { MakeId: null, MakeName: 'Ghost' },     // invalid rows dropped
    null,
  ];
  const blocked = new Set([normalizeMakeName('SpamTrucks Inc.')]);
  const makes = dedupeMakes(raw, blocked);
  assert.deepEqual(makes, [
    { id: 1, name: 'BMW', slug: 'bmw' },
    { id: 3, name: 'Audi', slug: 'audi' },
  ]);
});

test('dedupeMakes tolerates non-array input', () => {
  assert.deepEqual(dedupeMakes(undefined), []);
});

test('dedupeModels dedupes case-insensitively within a make', () => {
  const models = dedupeModels([
    { Model_Name: '530i' },
    { Model_Name: '530I' },                  // same model, different case
    { Model_Name: ' X5 ' },
    { Model_Name: '' },
    {},
  ], 42);
  assert.deepEqual(models, [
    { make_id: 42, name: '530i', slug: '530i' },
    { make_id: 42, name: 'X5', slug: 'x5' },
  ]);
});
