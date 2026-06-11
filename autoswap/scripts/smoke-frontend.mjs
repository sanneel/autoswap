#!/usr/bin/env node
/* ===================================================================
   smoke-frontend.mjs — offline browser smoke test for the front pages.

   Serves the repo over a local static server, loads every page in
   headless Chromium with ALL external requests blocked (fonts, the
   supabase-js CDN), and fails on any uncaught page error or an empty
   #app container. Also exercises: the offer modal demo gate, the
   value filter → URL sync, and the value sort.

   Requires Playwright with Chromium installed:
     npm i -D playwright && npx playwright install chromium
   Run from the project root:
     node scripts/smoke-frontend.mjs
=================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.mp3': 'audio/mpeg',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://127.0.0.1:${server.address().port}/front`;

const pages = ['index.html', 'cars.html', 'sell.html', 'vehicle.html?id=demo-bmw-530i', 'login.html', 'account.html'];

const browser = await chromium.launch();
const ctx = await browser.newContext();
await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
let failures = 0;

for (const pagePath of pages) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  await page.goto(`${BASE}/${pagePath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const hasContent = await page.evaluate(() => (document.querySelector('#app')?.innerHTML || '').length > 200);
  if (!hasContent) errors.push('app container empty');
  if (errors.length) {
    failures += 1;
    console.log(`✖ ${pagePath}\n  ${errors.join('\n  ')}`);
  } else {
    console.log(`✓ ${pagePath}`);
  }
  await page.close();
}

const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(`${BASE}/cars.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);

// Offer modal (demo gate) opens from a listing card.
await page.click('.car-row [data-offer]').catch(() => errs.push('offer button missing'));
await page.waitForTimeout(300);
if (!await page.evaluate(() => !!document.querySelector('.modal-overlay'))) errs.push('offer modal did not open');
await page.keyboard.press('Escape');

// Filters + sort are mirrored into the URL.
await page.click('.more-filters summary');
await page.fill('[name="valueMin"]', '40000').catch(() => errs.push('valueMin input missing'));
await page.dispatchEvent('[name="valueMin"]', 'change');
await page.selectOption('#sort-select', 'value_desc').catch(() => errs.push('value sort missing'));
await page.waitForTimeout(300);
const url = page.url();
if (!url.includes('valueMin=40000') || !url.includes('sort=value_desc')) errs.push(`URL not synced: ${url}`);
if (!await page.locator('.car-row').count()) errs.push('value filter wiped all demo rows');

console.log(errs.length ? `✖ interactions:\n  ${errs.join('\n  ')}` : '✓ interactions (offer modal, filters→URL, value sort)');
failures += errs.length ? 1 : 0;

await browser.close();
server.close();
process.exit(failures ? 1 : 0);
