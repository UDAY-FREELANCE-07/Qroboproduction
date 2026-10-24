// ESLint 9 flat config (replaces .eslintrc.json; `next lint` was removed in Next.js 16).
// Same rule set as before: Next.js "core-web-vitals".
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'],
  },
];

export default config;
