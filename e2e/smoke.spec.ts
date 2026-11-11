import { expect, test } from '@playwright/test';

test('loads the site with the right title and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('./');

  await expect(page).toHaveTitle('Daniel Dampson | Portfolio');
  await expect(page.getByRole('main')).toBeVisible();
  expect(errors).toEqual([]);
});
