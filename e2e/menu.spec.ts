import { expect, test } from '@playwright/test';

const menu = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Main menu' });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(menu(page)).toBeVisible();
});

test('arrow keys move the selection down the menu', async ({ page }) => {
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');

  await expect(menu(page).getByRole('button', { name: 'EXPERIENCE' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(menu(page).getByRole('button', { name: 'EXPERIENCE' })).toBeFocused();
});

test('hovering an item selects it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no hover on touch devices');

  await menu(page).getByRole('button', { name: 'CONTACT' }).hover();

  await expect(menu(page).getByRole('button', { name: 'CONTACT' })).toHaveAttribute(
    'aria-current',
    'true',
  );
});

test('tapping an item selects it', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch only');

  await menu(page).getByRole('button', { name: 'SKILLS' }).tap();

  await expect(menu(page).getByRole('button', { name: 'SKILLS' })).toHaveAttribute(
    'aria-current',
    'true',
  );
});

test('the whole menu is visible without scrolling', async ({ page }) => {
  await expect(menu(page).getByRole('button')).toHaveCount(7);
  for (const button of await menu(page).getByRole('button').all()) {
    await expect(button).toBeInViewport();
  }
});
