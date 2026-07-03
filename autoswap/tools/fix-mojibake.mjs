// One-off repair: <title> and meta description in front/*.html were
// round-tripped through cp1252 multiple times. Reverses the trip until
// the text is clean Georgian. Run: node tools/fix-mojibake.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs';

const FILES = ['index', 'cars', 'vehicle', 'sell', 'login', 'account']
  .map((n) => new URL(`../front/${n}.html`, import.meta.url));

// cp1252 0x80-0x9F differs from latin1: map those code points back to bytes.
const CP1252_HIGH = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85,
  '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8A,
  '‹': 0x8B, 'Œ': 0x8C, 'Ž': 0x8E, '‘': 0x91, '’': 0x92,
  '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
  '˜': 0x98, '™': 0x99, 'š': 0x9A, '›': 0x9B, 'œ': 0x9C,
  'ž': 0x9E, 'Ÿ': 0x9F,
};

function cp1252Encode(str) {
  const bytes = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp <= 0xFF) bytes.push(cp);
    else if (CP1252_HIGH[ch] !== undefined) bytes.push(CP1252_HIGH[ch]);
    else return null; // not representable — decoding has gone too far
  }
  return Buffer.from(bytes);
}

function unmojibake(str) {
  let current = str;
  for (let round = 0; round < 8; round += 1) {
    if (!/Ã|Â|áƒ/.test(current)) return current;
    const bytes = cp1252Encode(current);
    if (!bytes) return current;
    const next = bytes.toString('utf8');
    if (next === current || next.includes('�')) return current;
    current = next;
  }
  return current;
}

const write = process.argv.includes('--write');
for (const file of FILES) {
  const html = readFileSync(file, 'utf8');
  const fixed = html
    .replace(/(<title>)([^<]*)(<\/title>)/, (_, a, t, b) => a + unmojibake(t) + b)
    .replace(/(name="description" content=")([^"]*)(")/, (_, a, d, b) => a + unmojibake(d) + b);
  const title = fixed.match(/<title>([^<]*)<\/title>/)[1];
  const desc = fixed.match(/name="description" content="([^"]*)"/)[1];
  console.log(`${file.pathname.split('/').pop()}\n  title: ${title}\n  desc : ${desc}`);
  if (write && fixed !== html) writeFileSync(file, fixed);
}
console.log(write ? 'WROTE' : 'DRY RUN');
