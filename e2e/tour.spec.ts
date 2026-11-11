import { expect, test } from '@playwright/test';

const SECTIONS = [
  'ABOUT',
  'PROJECTS',
  'EXPERIENCE',
  'SKILLS',
  'EDUCATION',
  'CERTIFICATIONS',
  'CONTACT',
];

test('a keyboard-only tour visits every section and completes the objective', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'keyboard tour');
  await page.goto('./');
  const menu = page.getByRole('navigation', { name: 'Main menu' });
  await expect(menu).toBeVisible();

  for (const [i, label] of SECTIONS.entries()) {
    if (i > 0) await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('button', { name: label })).toHaveAttribute('aria-current', 'true');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: label })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu.getByRole('button', { name: label })).toBeFocused();
  }

  await expect(page.getByRole('progressbar', { name: 'Sections explored' })).toHaveAttribute(
    'aria-valuenow',
    '7',
  );
  await expect(page.getByRole('status')).toContainText(/objective complete/i);
});
