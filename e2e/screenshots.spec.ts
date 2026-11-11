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
  const labels = await page
    .getByRole('navigation', { name: 'Main menu' })
    .getByRole('button')
    .allTextContents();
  // Desktop: every section. Mobile: the first two are enough to show the layout.
  const shots = testInfo.project.name === 'mobile' ? labels.slice(0, 2) : labels;

  for (const [i, label] of shots.entries()) {
    if (i > 0) await page.keyboard.press('ArrowDown');
    await page
      .locator('[data-active="true"] img')
      .evaluate((img: HTMLImageElement) => img.decode());
    await page.screenshot({
      path: `${dir}/${testInfo.project.name}-${i + 1}-${label.toLowerCase()}.jpg`,
      quality: 80,
    });
  }
});
