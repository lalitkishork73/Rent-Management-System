import { defineConfig } from 'vitest/config';
import path from 'node:path';
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
