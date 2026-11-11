import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
/** The GitHub Pages redirect build, served under /portfolio/ like Pages does. */
const PAGES_PORT = 4174;
/** The spec that only makes sense against the Pages redirect build. */
const PAGES_SPEC = /pages-redirect\.spec\.ts/;
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
    baseURL: `http://localhost:${PORT}/`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: PAGES_SPEC,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        // Software WebGL, so the 3D layer renders the same with or without a GPU (CI).
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
      },
    },
    { name: 'mobile', testIgnore: PAGES_SPEC, use: { ...devices['Pixel 7'] } },
    // Real WebKit (Safari's engine) on an iPhone-sized touch screen.
    { name: 'iphone', testIgnore: PAGES_SPEC, use: { ...devices['iPhone 13'] } },
    // The old GitHub Pages address, which now only redirects to the domain.
    {
      name: 'pages',
      testMatch: PAGES_SPEC,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PAGES_PORT}` },
    },
  ],
  webServer: [
    {
      command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}/`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: `node scripts/pages-redirect.mjs && npx vite preview --outDir dist-pages --base /portfolio/ --port ${PAGES_PORT} --strictPort`,
      url: `http://localhost:${PAGES_PORT}/portfolio/`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
