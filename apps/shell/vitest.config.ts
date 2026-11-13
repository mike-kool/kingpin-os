import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: { __PAGES_BASE__: JSON.stringify('') },
});
