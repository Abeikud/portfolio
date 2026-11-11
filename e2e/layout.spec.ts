import { expect, test } from '@playwright/test';
import { ROUTES } from './routes';

const WIDTHS = [390, 768, 1440];

// Widths are set explicitly, so this only needs one browser project.
test.describe('no sideways scrolling', () => {
  test.skip(({ isMobile }) => isMobile, 'viewport widths are set explicitly');

  for (const width of WIDTHS) {
    for (const route of ROUTES) {
      test(`${route.name} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route.path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }
});

test('the mouse wheel still scrolls long pages on a computer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'wheel scrolling is a computer thing');
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.goto('projects/startingfive');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.mouse.move(640, 240);

  await page.mouse.wheel(0, 600);

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});
