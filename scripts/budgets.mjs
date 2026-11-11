// Size budgets for the production build (run after `npm run build`).
// Fails if what a first-time visitor downloads grows past these limits.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const KB = 1024;
const BUDGETS = [
  // [label, file matcher, measure, max bytes]
  ['entry JavaScript (gzip)', /^assets\/index-.*\.js$/, 'gzip', 130 * KB],
  ['stylesheet (gzip)', /^assets\/index-.*\.css$/, 'gzip', 12 * KB],
  ['each scene photo', /^assets\/.*\.webp$/, 'raw', 300 * KB],
  ['social preview image', /^og\.jpg$/, 'raw', 100 * KB],
];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

const files = walk('dist').map((path) => path.slice('dist/'.length));
let failed = false;

for (const [label, matcher, measure, max] of BUDGETS) {
  const matched = files.filter((file) => matcher.test(file));
  if (matched.length === 0) {
    console.error(`✘ ${label}: no files matched ${matcher}`);
    failed = true;
    continue;
  }
  for (const file of matched) {
    const path = join('dist', file);
    const size = measure === 'gzip' ? gzipSync(readFileSync(path)).length : statSync(path).size;
    const ok = size <= max;
    failed ||= !ok;
    console.log(
      `${ok ? '✓' : '✘'} ${label.padEnd(26)} ${(size / KB).toFixed(1).padStart(7)} KB / ${max / KB} KB  ${file}`,
    );
  }
}

if (failed) {
  console.error('\nSize budget exceeded.');
  process.exit(1);
}
