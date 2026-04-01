import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'
import * as tsconfig from '@lvce-editor/eslint-plugin-tsconfig'
import * as regex from '@lvce-editor/eslint-plugin-regex'

export default [
  ...config.default,
  ...config.recommendedNode,
  ...actions.default,
  ...tsconfig.default,
  ...regex.default,
  {
    rules: {
      'n/no-process-exit': 'off',
      'unicorn/no-process-exit': 'off',
      'no-console': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'n/no-extraneous-import': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      'github-actions/ci-versions': 'off',
      '@cspell/spellchecker': 'off',
    },
  },
  {
    ignores: ['**/fixtures/**'],
  },
]
