import js from '@eslint/js';
import nodeImport from 'eslint-plugin-node-import';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
  js.configs.recommended,
  {
    ignores: ['*/**/dist/', '*/**/vendor', '*/**/dummy-non-existing-folder'],
  },
  {
    files: ['packages/extension/**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        project: ['./packages/extension/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // External API data is untyped
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      // Turn off as we use React compiler
      'eslintreact-hooks/exhaustive-deps': 'off',
      'react-hooks/exhaustive-deps': 'off',
      // ESLint parser bug: monorepo types detected as `any`
      '@typescript-eslint/no-redundant-type-constituents': 'off',

      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-misused-promises': 'off',
    },
  },

  {
    files: ['types/**/*.ts'],
    plugins: { 'node-import': nodeImport },
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      eslintPluginPrettierRecommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
      sourceType: 'module',
      parserOptions: {
        project: ['./types/tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './types/tsconfig.json',
        },
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },
    rules: {
      'import/extensions': ['error', 'always', { js: 'always', ts: 'never' }],
      'import/no-unresolved': 'error',
      'node-import/require-file-extension': ['error', { '.js': 'always' }],
    },
  },
  {
    files: ['packages/server/**/*.ts'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      eslintPluginPrettierRecommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: [
          './packages/server/tsconfig.app.json',
          './packages/server/tsconfig.json',
          './types/tsconfig.json',
          './types/tsconfig.lib.json',
        ],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Allows using `any` type without errors
      '@typescript-eslint/no-explicit-any': 'off',

      // Warns about Promises without await/catch (possible unhandled errors)
      '@typescript-eslint/no-floating-promises': 'warn',

      // External API data is untyped
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',

      // ESLint parser bug: monorepo types detected as `any`
      '@typescript-eslint/no-redundant-type-constituents': 'off',

      // Prettier runs separately
      'prettier/prettier': 'off',
    },
  },
  {
    files: ['packages/functions/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [
          './packages/functions/tsconfig.json',
          './packages/functions/tsconfig.dev.json',
        ],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      quotes: ['error', 'double'],
      indent: ['error', 2],
      'import/no-unresolved': 'off',
    },
  },

  {
    ignores: ['dist', 'node_modules'],
  }
);
