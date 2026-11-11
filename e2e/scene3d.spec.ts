import { expect, test } from '@playwright/test';

// The Three.js layer over the main-menu photo (Phase 10). CI has no GPU, and
// the site refuses software-rendered WebGL, so these tests opt in to it (slow:
// hence the longer timeouts).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dd:allow-software-3d', '1'));
});
test.setTimeout(90_000);
const SLOW = { timeout: 30_000 };
const layer = (page: import('@playwright/test').Page) => page.locator('canvas[data-scene3d]');
const menu = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Main menu' });

test('a desktop browser gets the 3D layer, loaded after the menu', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones keep the photo only');
  const scripts: string[] = [];
  page.on('request', (req) => req.resourceType() === 'script' && scripts.push(req.url()));
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

  await page.goto('./');
  await expect(menu(page)).toBeVisible();
  await expect(layer(page)).toBeVisible(SLOW);
  await expect(layer(page)).toHaveAttribute('aria-hidden', 'true');

  // three.js arrives in its own chunk, not in the entry script.
  expect(scripts.some((url) => /Scene3D-[\w-]+\.js$/.test(url))).toBe(true);

  // It keeps drawing as the selection changes, and leaves with the menu.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/:\d+\/projects$/, SLOW);
  await expect(layer(page)).toHaveCount(0, SLOW);
  await page.keyboard.press('Escape');
  await expect(layer(page)).toBeVisible(SLOW);
  expect(errors).toEqual([]);
});

test('reduced motion keeps the photo only', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(menu(page)).toBeVisible();
  await page.waitForTimeout(500);
  await expect(layer(page)).toHaveCount(0);
});

test('phones keep the photo only', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone profiles only');
  await page.goto('./');
  await expect(menu(page)).toBeVisible();
  await page.waitForTimeout(500);
  await expect(layer(page)).toHaveCount(0);
});

test('switching 3D effects off in Settings removes it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones keep the photo only');
  await page.goto('./');
  await expect(layer(page)).toBeVisible(SLOW);

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  const toggle = page.getByRole('switch', { name: '3D effects' });
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await expect(layer(page)).toHaveCount(0);

  await page.reload();
  await expect(menu(page)).toBeVisible();
  await page.waitForTimeout(500);
  await expect(layer(page)).toHaveCount(0);
});

test('without a GPU the layer stays off and three.js is never downloaded', async ({
  browser,
  baseURL,
  isMobile,
}) => {
  test.skip(isMobile, 'phones keep the photo only anyway');
  // A fresh context without the opt-in: like a visitor on software rendering.
  const context = await browser.newContext({ baseURL, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const scripts: string[] = [];
  page.on('request', (req) => req.resourceType() === 'script' && scripts.push(req.url()));
  await page.goto('./');
  await expect(menu(page)).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await expect(menu(page).getByRole('button', { name: 'PROJECTS' })).toBeFocused();
  await expect(layer(page)).toHaveCount(0);
  expect(scripts.some((url) => /Scene3D-/.test(url))).toBe(false);
  await context.close();
});
