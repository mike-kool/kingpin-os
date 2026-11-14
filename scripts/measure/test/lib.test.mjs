import { describe, expect, it } from 'vitest';
import { countCodeLines, filesForEntry, parseManifest } from '../lib.mjs';

describe('filesForEntry', () => {
  const manifest = {
    'mui/index.html': { file: 'assets/mui.js', imports: ['_shared.js'], css: ['assets/mui.css'], dynamicImports: ['_lazy.js'] },
    '_shared.js': { file: 'assets/shared.js', css: ['assets/shared.css'], imports: ['_react.js'] },
    '_react.js': { file: 'assets/react.js', imports: ['_shared.js'] },
    '_lazy.js': { file: 'assets/lazy.js' },
  };

  it('follows static imports and their CSS, skips dynamic imports, handles cycles', () => {
    expect(filesForEntry(manifest, 'mui/index.html')).toEqual({
      js: ['assets/mui.js', 'assets/react.js', 'assets/shared.js'],
      css: ['assets/mui.css', 'assets/shared.css'],
    });
  });

  it('fails loudly for an unknown entry', () => {
    expect(() => filesForEntry(manifest, 'nope/index.html')).toThrow(/Not in manifest/);
  });
});

describe('countCodeLines', () => {
  it('skips blank lines and comments', () => {
    const src = [
      '// header',
      'import x from "y";',
      '',
      '/* one-line block */',
      '/**',
      ' * doc',
      ' */',
      'const a = 1; // trailing comment counts as code',
      '/* block */ const b = 2;',
      '.css { color: red; }',
    ].join('\n');
    expect(countCodeLines(src)).toBe(4);
  });
});

describe('parseManifest', () => {
  const names = ['AppShell', 'StatCard', 'DataTable', 'Tabs', 'Badge', 'TextField', 'Select', 'DatePicker', 'Textarea', 'Button', 'Modal', 'Toaster'];
  const src = (overrides = {}) =>
    names.map((n) => `    ${n}: '${overrides[n] ?? 'library'}', // note`).join('\n');

  it('counts hand-built and library components', () => {
    expect(parseManifest(src({ DataTable: 'hand-built', Toaster: 'hand-built' }))).toEqual({ handBuilt: 2, fromLibrary: 10 });
  });

  it('rejects a manifest missing a component', () => {
    expect(() => parseManifest(src().replace(/.*Modal.*\n/, ''))).toThrow(/missing: Modal/);
  });
});
