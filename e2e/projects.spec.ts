import { expect, test, type Page } from '@playwright/test';

const tiles = (page: Page) => page.getByRole('list', { name: 'Projects' });

test('keyboard: menu → Projects → a project → back → back', async ({ page, isMobile }) => {
  await page.goto('./');
  await expect(page.getByRole('navigation', { name: 'Main menu' })).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'PROJECTS' })).toBeVisible();

  // Tiles sit in a row on desktop and a single column on phones; the grid
  // measures its real columns, so the second tile is → or ↓ respectively.
  await page.keyboard.press(isMobile ? 'ArrowDown' : 'ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/:\d+\/projects\/disland$/);
  await expect(page.getByRole('heading', { level: 1, name: 'DIsland' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(tiles(page).getByRole('link', { name: 'DIsland' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('navigation', { name: 'Main menu' }).getByRole('button', { name: 'PROJECTS' }),
  ).toBeFocused();
});

test('tabs filter the tiles', async ({ page, isMobile }) => {
  await page.goto('projects');
  if (isMobile) {
    await page.getByRole('tab', { name: 'macOS' }).tap();
  } else {
    await page.keyboard.press('e');
    await page.keyboard.press('e');
  }

  await expect(tiles(page).getByRole('link')).toHaveCount(1);
  await expect(tiles(page).getByRole('link', { name: 'DIsland' })).toBeVisible();
});

test('a project page deep-links and shows its stack', async ({ page }) => {
  await page.goto('projects/startingfive');

  await expect(page.getByRole('heading', { level: 1, name: 'StartingFive' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Tech stack' }).getByRole('listitem')).toHaveCount(7);
});

test('on touch, tapping a tile opens it', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch only');
  await page.goto('projects');

  await tiles(page).getByRole('link', { name: 'StartingFive' }).tap();

  await expect(page.getByRole('heading', { level: 1, name: 'StartingFive' })).toBeVisible();
});
