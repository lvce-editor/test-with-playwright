import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config.default,
  ...config.recommendedNode,
  ...actions.default,
  {
    rules: {
      'n/no-process-exit': 'off',
      'unicorn/no-process-exit': 'off',
      'no-console': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'n/no-extraneous-import': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      'github-actions/ci-versions': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
    },
  },
  {
    ignores: ['**/fixtures/**'],
  },
]
