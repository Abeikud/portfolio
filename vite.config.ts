/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolveDeploy } from './config/deploy';

// GitHub Pages (/portfolio/) by default; the domain root on Vercel. See config/deploy.ts.
const { base, siteUrl } = resolveDeploy(process.env);

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      // index.html uses __SITE_URL__ for its canonical and link-preview URLs.
      name: 'site-url',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) => html.replaceAll('__SITE_URL__', siteUrl),
      },
    },
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'config/**/*.test.ts'],
    css: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
