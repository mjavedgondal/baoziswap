const prettierConfig = require('./.prettierrc.js');

module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    createDefaultProgram: true,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2019,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    'react',
    'import',
    'jsx-a11y',
    'react-hooks',
    '@typescript-eslint',
    'simple-import-sort',
    'prettier',
  ],
  overrides: [
    {
      files: '*.js',
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
  rules: {
    // 'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'prettier/prettier': ['error', prettierConfig],
    'quote-props': ['error', 'consistent-as-needed'],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line',
      },
    ],
    'sort-imports': 'off',
    'import/order': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-confusing-arrow': ['error', { allowParens: false }],
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
    'simple-import-sort/sort': [
      'error',
      {
        // https://github.com/lydell/eslint-plugin-simple-import-sort/blob/master/examples/.eslintrc.js#L71
        groups: [
          [
            '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
          ],
          ['^react', '^@?\\w'],
          ['^\\u0000'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ['^.+\\.s?css$'],
        ],
      },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          '{}': false,
        },
      },
    ],
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'no-nested-ternary': 'off',
    'no-continue': 'warn',
    'no-await-in-loop': 'warn',
    'camelcase': 'warn',
    'spaced-comment': 'off',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src/']],
        extensions: ['.ts', '.tsx', '.json', 'js', 'jsx'],
      },
    },
  },
};
