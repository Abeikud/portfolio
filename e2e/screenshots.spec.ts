import { test } from '@playwright/test';

/**
 * Not a test: captures review screenshots for a PR. Skipped unless
 * SCREENSHOTS_DIR is set, e.g.
 *   SCREENSHOTS_DIR=docs/screenshots/phase-3 npm run screenshots
 */
const dir = process.env.SCREENSHOTS_DIR;

test('capture the main menu', async ({ page }, testInfo) => {
  test.skip(!dir, 'set SCREENSHOTS_DIR to capture screenshots');

  // Reduced motion zeroes the transition tokens, so shots never catch an animation midway.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${dir}/${testInfo.project.name}-menu.png` });

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.screenshot({ path: `${dir}/${testInfo.project.name}-menu-experience.png` });
});
