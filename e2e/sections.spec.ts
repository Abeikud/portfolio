import { expect, test } from '@playwright/test';

test('About shows the bio and links its news to roles', async ({ page }) => {
  await page.goto('about');
  await expect(page.getByRole('heading', { level: 2, name: 'Daniel Dampson' })).toBeVisible();

  await page.getByRole('list', { name: 'Latest news' }).getByRole('link').first().click();

  await expect(page).toHaveURL(/\/portfolio\/experience\/gov-pei-summer-student$/);
});

test('Skills switches categories with E and shows the right cards', async ({ page }) => {
  await page.goto('skills');
  await expect(page.getByRole('list', { name: 'Skills' }).getByRole('listitem')).toHaveCount(8);

  await page.keyboard.press('e');

  await expect(page.getByRole('tab', { name: 'Frameworks' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('list', { name: 'Skills' }).getByRole('listitem')).toHaveCount(9);
});

test('Contact links are real', async ({ page }) => {
  await page.goto('contact');
  await expect(page.getByRole('link', { name: /Email/ })).toHaveAttribute('href', /^mailto:/);
  await expect(page.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/Abeikud',
  );
});
