import { expect, test } from '@playwright/test';

// Runs against a build served from the domain root, the way Vercel serves it
// (see the 'root' project in playwright.config.ts).
const SITE = 'https://example.test/';

test('a root-served build loads, deep-links, and points previews at its own URL', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main menu' })).toBeVisible();
  const photo = page.locator('[data-active="true"] img');
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', SITE);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `${SITE}og.jpg`,
  );

  await page.goto('/projects/startingfive');
  await expect(page.getByRole('heading', { level: 1, name: 'StartingFive' })).toBeVisible();

  expect((await request.get('/DDAMPSON_RESUME.pdf')).status()).toBe(200);
  expect(errors).toEqual([]);
});
