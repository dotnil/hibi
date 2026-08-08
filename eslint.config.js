import pluginVue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['dist/', 'public/'],
  },
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['warn', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    },
  },
]
