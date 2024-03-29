import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        globalSetup: ['./tests/global-setup.ts'],
        alias: {
            '~': './src'
        },
        coverage: {
            all: true,
            provider: 'istanbul',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.ts']
        },
        threads: false
    }
});
