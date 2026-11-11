import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
/** A second build served from the domain root, the way Vercel serves it. */
const ROOT_PORT = 4174;
/** The spec that only makes sense against the root-served build. */
const ROOT_SPEC = /root\.spec\.ts/;
const isCI = !!process.env.CI;

// E2E runs against the production build (`vite preview`) so we test what ships.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/portfolio/`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: ROOT_SPEC,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', testIgnore: ROOT_SPEC, use: { ...devices['Pixel 7'] } },
    // Real WebKit (Safari's engine) on an iPhone-sized touch screen.
    { name: 'iphone', testIgnore: ROOT_SPEC, use: { ...devices['iPhone 13'] } },
    // The root-served (Vercel-style) build: only root.spec.ts runs here.
    {
      name: 'root',
      testMatch: ROOT_SPEC,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${ROOT_PORT}/` },
    },
  ],
  webServer: [
    {
      command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}/portfolio/`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: `npx vite build --outDir dist-root --emptyOutDir && npx vite preview --outDir dist-root --port ${ROOT_PORT} --strictPort`,
      env: { BASE_PATH: '/', SITE_URL: 'https://example.test/' },
      url: `http://localhost:${ROOT_PORT}/`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
