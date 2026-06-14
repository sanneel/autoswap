// Element-level screenshots for design review.
// Usage: node tools/shoot-el.mjs <page> <selector> <outName> [mobile]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [, , pageName, selector, outName, mobile] = process.argv;
const OUT = 'tools/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();
await page.goto(`http://localhost:4189/front/${pageName}.html`, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(900);
const el = page.locator(selector).first();
await el.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await el.screenshot({ path: `${OUT}/${outName}.png` });
console.log(`${outName} ok`);
await browser.close();
