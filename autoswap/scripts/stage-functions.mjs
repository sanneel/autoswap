#!/usr/bin/env node
// The Supabase CLI only deploys from `supabase/functions/<name>/index.ts`, but
// this repo keeps its Edge Functions in `back/` (they sit alongside the SQL and
// the frontend rather than under the migration directory). The two layouts are
// otherwise identical - sibling function directories plus a `_shared` folder -
// so staging is a straight copy and the `../_shared/...` imports resolve
// unchanged.
//
// The staged copy is generated, gitignored, and rebuilt from scratch each run,
// so `back/` stays the single source of truth.
//
//   npm run functions:stage
//   supabase functions deploy request-otp --project-ref <ref>
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, '..', 'back');
const TARGET = resolve(here, '..', 'supabase', 'functions');

if (!existsSync(SOURCE)) {
  console.error(`stage-functions: no ${SOURCE} directory - run this from the repo.`);
  process.exit(1);
}

rmSync(TARGET, { recursive: true, force: true });
mkdirSync(TARGET, { recursive: true });
cpSync(SOURCE, TARGET, { recursive: true });

const staged = readdirSync(TARGET, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const deployable = staged.filter((name) => !name.startsWith('_'));
const missing = deployable.filter((name) => !existsSync(join(TARGET, name, 'index.ts')));

console.log(`stage-functions: staged ${deployable.length} function(s) into supabase/functions/`);
for (const name of deployable) console.log(`  ${name}`);
if (staged.includes('_shared')) console.log('  _shared (shared modules, not deployed on its own)');

if (missing.length) {
  console.error(`stage-functions: missing index.ts in: ${missing.join(', ')}`);
  process.exit(1);
}
