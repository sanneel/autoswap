import { cpSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const FRONT = resolve(here, '..', 'front');
const DIST = resolve(here, '..', 'dist');

rmSync(DIST, { recursive: true, force: true });
cpSync(FRONT, DIST, { recursive: true });

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const htmlFiles = readdirSync(DIST).filter((name) => name.endsWith('.html'));

const referenced = new Set();
for (const file of htmlFiles) {
  const text = readFileSync(join(DIST, file), 'utf8');
  for (const m of text.matchAll(/["'(]\/?([\w.-]+\.(?:js|css))(?:\?v=\d+)?(?=["')])/g)) {
    referenced.add(m[1]);
  }
}

const onDisk = new Set(readdirSync(DIST).filter((name) => ['.js', '.css'].includes(extname(name))));
const targets = [...referenced].filter((name) => onDisk.has(name)).sort();

const missing = [...referenced].filter((name) => !onDisk.has(name));
if (missing.length) {
  console.error(`hash-assets: HTML references files that do not exist: ${missing.join(', ')}`);
  process.exit(1);
}

if (!targets.length) {
  console.error('hash-assets: no referenced .js or .css found in dist/: is the build running from the right place?');
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

// Hashed names never change content, so they may cache forever. Appended to
// the copied _headers: on Cloudflare Pages the last matching rule wins, so
// these beat the generic must-revalidate rules for the hashed files only.
const nl = String.fromCharCode(10);
const headerLines = [''];
for (const hashed of renames.values()) {
  headerLines.push(`/${hashed}`, '  Cache-Control: public, max-age=31536000, immutable');
}
const headersPath = join(DIST, '_headers');
const base = readFileSync(headersPath, 'utf8');
writeFileSync(headersPath, base.replace(/\s+$/, '') + nl + headerLines.join(nl) + nl);

console.log(`hash-assets: hashed ${renames.size} files, rewrote ${rewrites} references in ${htmlFiles.length} HTML files`);
for (const [original, hashed] of renames) console.log(`  ${original} → ${hashed}`);
