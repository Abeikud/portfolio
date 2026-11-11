import { expect, test, type Page } from '@playwright/test';

const menu = (page: Page) => page.getByRole('navigation', { name: 'Main menu' });
const menuItem = (page: Page, label: string) => menu(page).getByRole('button', { name: label });

test('Enter opens a section and Escape comes back to the same item', async ({ page }) => {
  await page.goto('./');
  await expect(menu(page)).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/portfolio\/projects$/);
  await expect(page.getByRole('heading', { level: 1, name: 'PROJECTS' })).toBeFocused();

  await page.keyboard.press('Escape');

  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(menuItem(page, 'PROJECTS')).toHaveAttribute('aria-current', 'true');
  await expect(menuItem(page, 'PROJECTS')).toBeFocused();
});

test('the browser back button returns to the menu with the selection kept', async ({ page }) => {
  await page.goto('./');
  await expect(menu(page)).toBeVisible();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'CONTACT' })).toBeVisible();

  await page.goBack();

  await expect(menuItem(page, 'CONTACT')).toHaveAttribute('aria-current', 'true');
});

test('deep links load the right screen (SPA fallback)', async ({ page }) => {
  await page.goto('experience');
  await expect(page.getByRole('heading', { level: 1, name: 'EXPERIENCE' })).toBeVisible();
});

test('unknown paths show the not-found screen', async ({ page }) => {
  await page.goto('definitely-not-a-page');
  await expect(page.getByRole('heading', { level: 1, name: 'PAGE NOT FOUND' })).toBeVisible();
});

test('on touch, the first tap selects and the second enters', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch only');
  await page.goto('./');

  await menuItem(page, 'SKILLS').tap();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await menuItem(page, 'SKILLS').tap();

  await expect(page.getByRole('heading', { level: 1, name: 'SKILLS' })).toBeVisible();
});
