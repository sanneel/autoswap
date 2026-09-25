import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/vehicle.js';

const ID = 'd79b551a-eb3c-4d04-82f8-440b917e454a';
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

// Runs the function with a stubbed static page and a counting fetch. The
// rewrite itself needs Workers' HTMLRewriter, so these assert only on whether
// Supabase was asked, which is the part that costs the round trip.
async function run(headers) {
  const page = new Response('<html><head><title>AutoSwap</title></head></html>', {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
  let lookups = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    lookups += 1;
    return new Response('[]', { headers: { 'content-type': 'application/json' } });
  };
  try {
    const response = await onRequestGet({
      request: new Request(`https://autoswap.ge/vehicle?id=${ID}`, { headers }),
      env: { AUTO_SWAP_SUPABASE_URL: 'https://example.supabase.co', AUTO_SWAP_SUPABASE_ANON_KEY: 'anon' },
      next: async () => page,
    });
    return { response, lookups };
  } finally {
    globalThis.fetch = realFetch;
  }
}

test('a browser navigation is served the static page without a Supabase lookup', async () => {
  const { response, lookups } = await run({ 'user-agent': CHROME, 'sec-fetch-dest': 'document' });
  assert.equal(lookups, 0);
  assert.equal(response.status, 200);
});

test('a browser prerender is treated like a navigation', async () => {
  const { lookups } = await run({ 'user-agent': CHROME, 'sec-fetch-dest': 'document', 'sec-purpose': 'prefetch;prerender' });
  assert.equal(lookups, 0);
});

test('preview crawlers still get the listing looked up', async () => {
  for (const ua of ['WhatsApp/2.24.1 A', 'facebookexternalhit/1.1', 'TelegramBot (like TwitterBot)', 'Viber']) {
    const { lookups } = await run({ 'user-agent': ua });
    assert.equal(lookups, 1, ua);
  }
});

test('a crawler that sends Sec-Fetch-Dest is still recognised by name', async () => {
  const { lookups } = await run({ 'user-agent': `${CHROME} (compatible; Googlebot/2.1)`, 'sec-fetch-dest': 'document' });
  assert.equal(lookups, 1);
});
