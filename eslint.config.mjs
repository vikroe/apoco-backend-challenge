// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    {
        ignores: ['build/**'],
    },
    eslint.configs.recommended,
    tseslint.configs.strict,
    {
        files: [
            '**/*.test.{js,cjs,mjs,ts,jsx,tsx}',
            '**/*.spec.{js,cjs,mjs,ts,jsx,tsx}',
            'test/**/*.{js,cjs,mjs,ts,jsx,tsx}',
        ],
        languageOptions: {
            globals: {
                afterAll: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                beforeEach: 'readonly',
                describe: 'readonly',
                expect: 'readonly',
                it: 'readonly',
                test: 'readonly',
                vi: 'readonly',
            },
        },
    }
);
