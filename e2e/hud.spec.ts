import { expect, test } from '@playwright/test';

test('exploring fills the HUD, and it survives a reload', async ({ page }) => {
  await page.goto('skills');
  await expect(page.getByRole('heading', { level: 1, name: 'SKILLS' })).toBeVisible();
  await page.goto('about');
  await expect(page.getByRole('heading', { level: 1, name: 'ABOUT' })).toBeVisible();
  await page.goto('./');

  const hud = page.getByRole('progressbar', { name: 'Sections explored' });
  await expect(hud).toHaveAttribute('aria-valuenow', '2');
  await page.reload();
  await expect(hud).toHaveAttribute('aria-valuenow', '2');
});

test('the settings switch turns motion off', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('switch', { name: 'Reduce motion' }).click();

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-drift]')).toHaveAttribute('data-drift', 'false');
});
