import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
    },
    setupFiles: ['./tests/setup_server.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    isolate: false,
  },
});
