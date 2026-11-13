import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// One HTML entry per library, so each iframe loads only that library's
// provider, reset and CSS, and the build reports exact per-library sizes.
// The build lands in the same dist folder as the shell (built first).
// Entries are the folders holding an index.html (shadcn/, mui/, ...).
const root = import.meta.dirname;
const entries = Object.fromEntries(
  readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(resolve(root, d.name, 'index.html')))
    .map((d) => [d.name, resolve(root, d.name, 'index.html')]),
);

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/__showcase/' : '/',
  server: { port: 5174, strictPort: true },
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    rollupOptions: { input: entries },
  },
}));
