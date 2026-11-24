import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
    },
    globalSetup: ['./test_helpers/setup_server.ts'],
    setupFiles: ['./test_helpers/xml_matcher.ts'],
  },
});
