// Pure helpers for the measure script, kept separate so they can be tested.

import { gzipSync } from 'node:zlib';

/**
 * Every file a Vite entry loads up front: its chunk, statically imported
 * chunks, and all of their CSS. Dynamic imports are left out because they
 * load later, if at all.
 * @param {Record<string, any>} manifest Vite build manifest
 * @param {string} entryKey manifest key of the HTML entry, e.g. "mui/index.html"
 */
export function filesForEntry(manifest, entryKey) {
  const js = new Set();
  const css = new Set();
  const seen = new Set();
  const visit = (key) => {
    if (seen.has(key)) return;
    seen.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Not in manifest: ${key}`);
    if (chunk.file?.endsWith('.js')) js.add(chunk.file);
    if (chunk.file?.endsWith('.css')) css.add(chunk.file);
    for (const c of chunk.css ?? []) css.add(c);
    for (const i of chunk.imports ?? []) visit(i);
  };
  visit(entryKey);
  return { js: [...js].sort(), css: [...css].sort() };
}

/** Gzipped size in bytes, at the level static hosts typically serve. */
export function gzipSize(buffer) {
  return gzipSync(buffer, { level: 9 }).length;
}

/**
 * Lines that are code: not blank and not only a comment. Good enough for a
 * like-for-like comparison between libraries; not a full parser.
 * @param {string} source
 */
export function countCodeLines(source) {
  let inBlock = false;
  let count = 0;
  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (inBlock) {
      if (line.includes('*/')) {
        inBlock = false;
        const rest = line.slice(line.indexOf('*/') + 2).trim();
        if (rest) count++;
      }
      continue;
    }
    if (!line || line.startsWith('//')) continue;
    if (line.startsWith('/*')) {
      if (!line.includes('*/')) inBlock = true;
      else if (line.slice(line.indexOf('*/') + 2).trim()) count++;
      continue;
    }
    count++;
  }
  return count;
}

const COMPONENT_NAMES = [
  'AppShell', 'StatCard', 'DataTable', 'Tabs', 'Badge', 'TextField',
  'Select', 'DatePicker', 'Textarea', 'Button', 'Modal', 'Toaster',
];

/**
 * Reads a ui-* package's manifest.ts and counts hand-built vs library
 * components. Throws if any contract component is missing.
 * @param {string} source contents of manifest.ts
 */
export function parseManifest(source) {
  const found = {};
  for (const m of source.matchAll(/^\s*(\w+):\s*'(library|hand-built)'/gm)) found[m[1]] = m[2];
  const missing = COMPONENT_NAMES.filter((n) => !found[n]);
  if (missing.length) throw new Error(`manifest.ts is missing: ${missing.join(', ')}`);
  const values = COMPONENT_NAMES.map((n) => found[n]);
  return {
    handBuilt: values.filter((v) => v === 'hand-built').length,
    fromLibrary: values.filter((v) => v === 'library').length,
  };
}
