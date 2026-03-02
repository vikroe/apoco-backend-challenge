import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globalSetup: ['./src/test/globalSetup.ts'],
        globals: true,
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        passWithNoTests: true,
        setupFiles: ['./src/test/setup.ts'],
    },
});
