import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', '.lighthouseci/'] },
  js.configs.recommended,
  {
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'error',
    },
  },
  {
    files: ['site/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Os testes rodam no Node, mas o código dentro de page.evaluate roda no navegador.
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
