#!/usr/bin/env node
// Responsive layout audit for the static frontend.
//
// Serves front/ locally, opens every page at phone, tablet and desktop widths
// and reports layout defects the eye would catch on a real device:
//   - horizontal page scroll (document or body wider than the viewport)
//   - elements that poke past the viewport edge without a clipping ancestor
//   - text clipped by an overflow:hidden box without an ellipsis
//   - text under 11px
//   - interactive elements smaller than 32px on either axis
// Also writes viewport-sized screenshots (scrolling the body, which is the
// scroll container on mobile) so a human can review the result.
//
//   node scripts/responsive-audit.mjs [outDir]
//   ONLY=p390,d1280 PAGES=cars,sell SHOTS=0 node scripts/responsive-audit.mjs
//
// Exit code is 1 when any page scrolls horizontally or leaks past the viewport.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'front');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '..', 'test-results', 'responsive'));
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const PAGES_ONLY = process.env.PAGES ? process.env.PAGES.split(',') : null;
const SHOTS = process.env.SHOTS !== '0';
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg',
};
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (urlPath === '/') urlPath = '/index.html';
  let file = path.join(ROOT, urlPath);
  if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://127.0.0.1:${server.address().port}`;

const VIEWPORTS = [
  { name: 'p320', width: 320, height: 568, mobile: true },
  { name: 'p360', width: 360, height: 780, mobile: true },
  { name: 'p390', width: 390, height: 844, mobile: true },
  { name: 'p430', width: 430, height: 932, mobile: true },
  { name: 't768', width: 768, height: 1024, mobile: true },
  { name: 't1024', width: 1024, height: 768, mobile: false },
  { name: 'd1280', width: 1280, height: 800, mobile: false },
  { name: 'd1440', width: 1440, height: 900, mobile: false },
];
const PAGES = [
  'index.html', 'cars.html', 'sell.html', 'login.html', 'account.html', 'about.html',
  'terms.html', 'privacy.html', '404.html', 'vehicle.html?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b',
];

const AUDIT = `(() => {
  const vw = window.innerWidth;
  const out = { vw, docW: document.documentElement.scrollWidth, bodyW: document.body.scrollWidth, overflow: [], clipped: [], tinyText: [], smallTargets: [] };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const describe = (el) => {
    const parts = [];
    let e = el;
    for (let n = 0; e && e.nodeType === 1 && n < 4; n++) {
      let s = e.tagName.toLowerCase();
      if (e.id) { parts.unshift(s + '#' + e.id); break; }
      if (typeof e.className === 'string' && e.className.trim()) s += '.' + e.className.trim().split(/\\s+/).slice(0, 3).join('.');
      parts.unshift(s);
      e = e.parentElement;
    }
    return parts.join(' > ');
  };
  const text = (el) => (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.right > vw + 1 || r.left < -1) {
      let p = el.parentElement, clipper = null;
      while (p && p !== document.body) {
        const pcs = getComputedStyle(p);
        if (/(hidden|auto|scroll|clip)/.test(pcs.overflowX + pcs.overflow)) {
          const pr = p.getBoundingClientRect();
          if (pr.right <= vw + 1 && pr.left >= -1) { clipper = describe(p); break; }
        }
        p = p.parentElement;
      }
      out.overflow.push({ sel: describe(el), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), clipper, text: text(el) });
    }
    if (/hidden|clip/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2 && cs.textOverflow !== 'ellipsis' && !el.querySelector('img,svg,video,canvas') && (el.textContent || '').trim()) {
      out.clipped.push({ sel: describe(el), scrollW: el.scrollWidth, clientW: el.clientWidth, text: text(el) });
    }
    const ownText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    if (ownText && parseFloat(cs.fontSize) < 11) out.tinyText.push({ sel: describe(el), fs: cs.fontSize, text: text(el) });
    if (el.matches('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab]') && (r.width < 32 || r.height < 32)) {
      out.smallTargets.push({ sel: describe(el), w: Math.round(r.width), h: Math.round(r.height), text: text(el) });
    }
  }
  out.overflow.sort((a, b) => b.right - a.right);
  return out;
})()`;

async function screenshotSegments(page, vp, name) {
  const total = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
  const steps = Math.min(8, Math.ceil(total / vp.height));
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => { document.body.scrollTop = y; document.documentElement.scrollTop = y; window.scrollTo(0, y); }, i * vp.height);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, `${name}_${i}.png`) });
  }
  await page.evaluate(() => { document.body.scrollTop = 0; document.documentElement.scrollTop = 0; window.scrollTo(0, 0); });
}

async function auditState(page, vp, label, report) {
  const res = await page.evaluate(AUDIT);
  report.push({ vp: vp.name, page: label, ...res });
  const widest = Math.max(res.docW, res.bodyW);
  const leaks = res.overflow.filter((o) => !o.clipper);
  const flag = widest > vp.width + 1 ? `HSCROLL ${widest}>${vp.width}` : leaks.length ? `LEAK ${leaks[0].sel}` : '';
  console.log(`${vp.name.padEnd(6)} ${label.slice(0, 22).padEnd(23)} ${flag.padEnd(28)} ovf=${res.overflow.length} clip=${res.clipped.length} tiny=${res.tinyText.length} small=${res.smallTargets.length}`);
  return widest > vp.width + 1 || leaks.length > 0;
}

const browser = await chromium.launch();
const report = [];
let failures = 0;
for (const vp of VIEWPORTS) {
  if (ONLY && !ONLY.includes(vp.name)) continue;
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, deviceScaleFactor: 1, locale: 'ka-GE',
  });
  for (const p of PAGES) {
    if (PAGES_ONLY && !PAGES_ONLY.some((x) => p.startsWith(x))) continue;
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${BASE}/${p}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(700);
    const name = `${vp.name}_${p.replace(/\.html.*$/, '')}`;
    if (await auditState(page, vp, p, report)) failures += 1;
    if (errors.length) console.log(`       page errors: ${errors.join(' | ')}`);
    if (SHOTS) await screenshotSegments(page, vp, name);

    if (p === 'cars.html') {
      const toggle = page.locator('#filters-toggle, #filters-adv-btn');
      if (await toggle.count()) {
        await toggle.first().click().catch(() => {});
        await page.waitForTimeout(500);
        if (await auditState(page, vp, 'cars.html#filters', report)) failures += 1;
        if (SHOTS) await page.screenshot({ path: path.join(OUT, `${name}_filters.png`) });
        await page.keyboard.press('Escape');
      }
    }
    await page.close();
  }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
server.close();
console.log(`\n${report.length} page/viewport states audited, ${failures} with horizontal overflow. Details: ${path.join(OUT, 'report.json')}`);
process.exit(failures ? 1 : 0);
