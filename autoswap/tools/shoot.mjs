// Screenshot every front page at desktop + mobile for design review.
// Usage: node tools/shoot.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4189/front';
const OUT = process.argv[2] || 'tools/shots';
const PAGES = ['index', 'cars', 'vehicle', 'sell', 'login', 'account'];
const VIEWPORTS = [
  { tag: 'desktop', width: 1440, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const name of PAGES) {
    await page.goto(`${BASE}/${name}.html`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${name}-${vp.tag}.png`, fullPage: true });
    console.log(`${name}-${vp.tag} ok`);
  }
  await ctx.close();
}
await browser.close();
