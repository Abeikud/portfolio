import { expect, test } from '@playwright/test';

test('keyboard: menu → Experience → a role → back', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('navigation', { name: 'Main menu' })).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'EXPERIENCE' })).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/:\d+\/experience\/gov-pei-summer-student$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Summer Student' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('list', { name: 'Roles' }).getByRole('link').first()).toBeFocused();
});

test('education and certifications deep-link and list their content', async ({ page }) => {
  await page.goto('education');
  await expect(page.getByRole('list', { name: 'Coursework' }).getByRole('listitem')).toHaveCount(5);

  await page.goto('certifications');
  await expect(
    page.getByRole('list', { name: 'Certifications' }).getByRole('listitem'),
  ).toHaveCount(2);
});
