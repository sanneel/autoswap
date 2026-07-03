// One-off design-review shots with a seeded demo session + my-car.
// Usage: node tools/shoot-authed.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4189/front';
const OUT = 'tools/shots';
mkdirSync(OUT, { recursive: true });

const SEED = () => {
  localStorage.setItem('autoswap.demoUser', JSON.stringify({ name: 'სანდრო', phone: '+995599112233' }));
  localStorage.setItem('autoswap_my_car', JSON.stringify({ make: 'BMW', model: '530i', year: '2020' }));
};

const SHOTS = [
  { page: 'sell', name: 'sell-authed', vp: { width: 1440, height: 900 } },
  { page: 'cars', name: 'cars-mycar', vp: { width: 1440, height: 900 } },
  { page: 'sell', name: 'sell-authed-mobile', vp: { width: 390, height: 844 } },
  { page: 'cars', name: 'cars-mycar-mobile', vp: { width: 390, height: 844 } },
];

const browser = await chromium.launch();
for (const shot of SHOTS) {
  const ctx = await browser.newContext({ viewport: shot.vp, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${shot.page}.html`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.evaluate(SEED);
  await page.goto(`${BASE}/${shot.page}.html`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: true });
  console.log(`${shot.name} ok`);
  await ctx.close();
}
await browser.close();
