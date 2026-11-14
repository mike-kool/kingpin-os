#!/usr/bin/env node
// Writes dist/stats.json after `pnpm build`: for each library that has a
// packages/ui-<id> kit, the gzipped JS and CSS its page loads, the lines of
// code in its kit, and how many contract components were hand-built.
// The shell reads this file for its badges, so no number is typed by hand.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { countCodeLines, filesForEntry, gzipSize, parseManifest } from './lib.mjs';

const root = resolve(import.meta.dirname, '../..');
const dist = join(root, 'dist');
const manifestPath = join(dist, '.vite/showcase-manifest.json');

if (!existsSync(manifestPath)) {
  console.error('No build manifest found. Run `pnpm build` first.');
  process.exit(1);
}
const viteManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const libraries = {};
const kits = readdirSync(join(root, 'packages'))
  .filter((d) => d.startsWith('ui-'))
  .map((d) => d.slice(3))
  .sort();

for (const id of kits) {
  const entryKey = `${id}/index.html`;
  if (!viteManifest[entryKey]) throw new Error(`packages/ui-${id} exists but the showcase has no ${entryKey}`);

  const files = filesForEntry(viteManifest, entryKey);
  const size = (list) => list.reduce((sum, f) => sum + gzipSize(readFileSync(join(dist, f))), 0);

  const kitDir = join(root, 'packages', `ui-${id}`, 'src');
  const sources = walk(kitDir).filter((p) => /\.(tsx?|css)$/.test(p));
  const linesOfCode = sources.reduce((sum, p) => sum + countCodeLines(readFileSync(p, 'utf8')), 0);

  const manifestFile = join(kitDir, 'manifest.ts');
  if (!existsSync(manifestFile)) throw new Error(`Missing ${relative(root, manifestFile)}`);
  const { handBuilt, fromLibrary } = parseManifest(readFileSync(manifestFile, 'utf8'));

  libraries[id] = {
    jsGzip: size(files.js),
    cssGzip: size(files.css),
    linesOfCode,
    handBuilt,
    fromLibrary,
  };
}

const stats = { generatedAt: new Date().toISOString(), libraries };
writeFileSync(join(dist, 'stats.json'), JSON.stringify(stats, null, 2) + '\n');
// The manifest is only needed here; keep it out of the deployed site.
rmSync(join(dist, '.vite'), { recursive: true, force: true });

for (const [id, s] of Object.entries(libraries)) {
  console.log(
    `${id.padEnd(8)} JS ${(s.jsGzip / 1024).toFixed(1)} KB  CSS ${(s.cssGzip / 1024).toFixed(1)} KB  ` +
      `${s.linesOfCode} LOC  ${s.fromLibrary} library / ${s.handBuilt} hand-built`,
  );
}
