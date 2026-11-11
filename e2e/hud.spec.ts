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

test('the settings switch turns motion off', async ({ page, isMobile }) => {
  await page.goto('./');
  await expect(page.getByRole('navigation', { name: 'Main menu' })).toBeVisible();
  if (isMobile) {
    await page.getByRole('button', { name: 'Settings' }).tap();
    await page.getByRole('switch', { name: 'Reduce motion' }).tap();
  } else {
    await page.keyboard.press('ArrowLeft'); // into the icon rail: the gear
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab'); // into the panel: the switch
    await expect(page.getByRole('switch', { name: 'Reduce motion' })).toBeFocused();
    await page.keyboard.press('Space');
  }

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-drift]')).toHaveAttribute('data-drift', 'false');
});
