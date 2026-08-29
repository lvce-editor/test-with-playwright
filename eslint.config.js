import { defineConfig } from 'eslint/config'
import * as config from '@lvce-editor/eslint-config'
import * as tsconfig from '@lvce-editor/eslint-plugin-tsconfig'

export default defineConfig([
  ...config.default,
  ...config.recommendedNode,
  ...config.recommendedActions,
  ...config.recommendedRegex,
  ...tsconfig.default,
  {
    rules: {
      'n/no-process-exit': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-nonstandard-builtin-properties': 'off',
      'no-console': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'n/no-extraneous-import': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      'github-actions/ci-versions': 'off',
      '@cspell/spellchecker': 'off',
    },
  },
  {
    ignores: ['**/.test-with-playwright/**', '**/fixtures/**'],
  },
  {
    files: ['packages/e2e/**/*.ts'],
    rules: {
      'e2e/no-imports': 'off',
    },
  },
])
