// Build step: copy front/ to dist/ and give every JS and CSS file a name
// derived from its own contents, then point the HTML at those names.
//
// Why this exists. The site used hand-maintained `?v=N` query strings against
// assets served immutable for a year. HTML and assets deploy as separate
// objects and can become visible at different moments, so there is a window
// where a browser reads new HTML, requests `shared.js?v=84`, and is handed the
// PREVIOUS file body — which it then caches under the new name for a year.
// That happened on 2026-08-13: the page reported v=83 loaded while the running
// code was v=82's, and the only escape was shipping a version nobody had
// requested yet. Anyone who loaded during the window was stuck until then.
//
// A content hash closes the window by construction rather than by timing:
// `shared.4f2a1c9e0b.js` cannot exist before the bytes that named it, so there
// is nothing stale to serve under that name. Forgetting to bump is also no
// longer possible, which was the other half of the old scheme's cost.
//
// Only JS and CSS are hashed. They are the files that carry behaviour and the
// ones that broke; images and fonts are referenced by stable paths from inside
// CSS and JS, so hashing them would mean rewriting those files too — and a
// stale image is a cosmetic problem, not a broken application.
import { cpSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const FRONT = resolve(here, '..', 'front');
const DIST = resolve(here, '..', 'dist');

// Built into a separate directory on purpose. Rewriting front/ in place would
// mean `npm run build` leaves the working tree dirty and the source HTML
// pointing at hashed names that only exist after a build.
rmSync(DIST, { recursive: true, force: true });
cpSync(FRONT, DIST, { recursive: true });

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const htmlFiles = readdirSync(DIST).filter((name) => name.endsWith('.html'));

// Only files the HTML actually loads. Hashing everything on disk also renamed
// supabase-config.example.js, a checked-in template nothing links to — a
// hashed name there is noise at best and a confusing artefact at worst.
const referenced = new Set();
for (const file of htmlFiles) {
  const text = readFileSync(join(DIST, file), 'utf8');
  for (const m of text.matchAll(/["'(]\/?([\w.-]+\.(?:js|css))(?:\?v=\d+)?(?=["')])/g)) {
    referenced.add(m[1]);
  }
}

const onDisk = new Set(readdirSync(DIST).filter((name) => ['.js', '.css'].includes(extname(name))));
const targets = [...referenced].filter((name) => onDisk.has(name)).sort();

// A reference to a file that is not there would 404 at runtime; catch it here.
const missing = [...referenced].filter((name) => !onDisk.has(name));
if (missing.length) {
  console.error(`hash-assets: HTML references files that do not exist: ${missing.join(', ')}`);
  process.exit(1);
}

if (!targets.length) {
  console.error('hash-assets: no referenced .js or .css found in dist/ — is the build running from the right place?');
  process.exit(1);
}

const renames = new Map();
for (const name of targets) {
  const ext = extname(name);
  const base = name.slice(0, -ext.length);
  const bytes = readFileSync(join(DIST, name));
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10);
  const hashedName = `${base}.${hash}${ext}`;
  renameSync(join(DIST, name), join(DIST, hashedName));
  renames.set(name, hashedName);
}

// Rewrite the references. Matches an optional leading slash and an optional
// legacy ?v=N, and stops at the closing quote so a longer filename sharing a
// prefix cannot be partially matched.
let rewrites = 0;
for (const file of htmlFiles) {
  const path = join(DIST, file);
  let text = readFileSync(path, 'utf8');
  for (const [original, hashed] of renames) {
    const re = new RegExp(`(["'(])(/?)${escapeRe(original)}(\\?v=\\d+)?(?=["')])`, 'g');
    text = text.replace(re, (_m, quote, slash) => {
      rewrites += 1;
      return `${quote}${slash}${hashed}`;
    });
  }
  writeFileSync(path, text);
}

// A leftover ?v= on a JS or CSS reference means a file was renamed but its
// reference was not — the deploy would 404 on it. Fail the build instead.
const stale = [];
for (const file of htmlFiles) {
  const text = readFileSync(join(DIST, file), 'utf8');
  const found = text.match(/["'(]\/?[\w.-]+\.(?:js|css)\?v=\d+/g);
  if (found) stale.push(`${file}: ${found.join(', ')}`);
}
if (stale.length) {
  console.error('hash-assets: unhashed ?v= references remain:\n  ' + stale.join('\n  '));
  process.exit(1);
}

console.log(`hash-assets: hashed ${renames.size} files, rewrote ${rewrites} references in ${htmlFiles.length} HTML files`);
for (const [original, hashed] of renames) console.log(`  ${original} → ${hashed}`);
