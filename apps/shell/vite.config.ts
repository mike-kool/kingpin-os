import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev the library pages run on the showcase server (port 5174) under
// /__showcase/. Proxying that path keeps the iframes same-origin, as they are
// in the deployed site, where both apps are built into one dist folder.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: {
    __PAGES_BASE__: JSON.stringify(command === 'serve' ? '/__showcase' : ''),
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/__showcase/': { target: 'http://localhost:5174', ws: true } },
  },
  build: { outDir: '../../dist', emptyOutDir: true },
}));
