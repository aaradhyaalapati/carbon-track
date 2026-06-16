import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      include: ['src/lib/**/*.ts'],
      exclude: [
        'src/lib/**/*.test.ts',
        'src/lib/index.ts',
        'src/lib/api.ts',
        'src/lib/firebase.ts',
        'src/lib/rate-limit.ts',
        'src/lib/repository.ts',
      ],
      thresholds: {
        lines: 98,
        functions: 100,
        branches: 95,
        statements: 98,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
