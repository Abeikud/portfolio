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

test('on a computer the mouse is ignored and its pointer hidden, with no pop-up', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'touch devices still tap');
  const contact = menu(page).getByRole('button', { name: 'CONTACT' });
  const box = (await contact.boundingBox())!;

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

  await expect(menu(page).getByRole('button', { name: 'ABOUT' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.getByRole('status', { name: 'Keyboard controls' })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).cursor)).toBe('none');
});

test('touch screens keep a normal pointer', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch only');
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).cursor))
    .not.toBe('none');
});

test('← reaches the icon rail and the settings', async ({ page }) => {
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('button', { name: 'Settings' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('link', { name: 'GitHub' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(menu(page).getByRole('button', { name: 'ABOUT' })).toBeFocused();
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

test('the preview panel and background follow the selection', async ({ page }) => {
  await page.keyboard.press('ArrowDown');

  await expect(
    page.getByRole('heading', { level: 2, name: 'DIVE STRAIGHT INTO THE BUILD' }),
  ).toBeVisible();
  await expect(page.locator('[data-scene="projects"]')).toHaveAttribute('data-active', 'true');
  await expect(page.getByRole('link', { name: 'Enter Projects' })).toBeInViewport();
});

test('the active scene photo actually loads', async ({ page }) => {
  const photo = page.locator('[data-scene="about"] img');
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
    .toBeGreaterThan(0);
});

test('the preview’s Enter pill is never covered (e.g. by the objective toast)', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'a tap target check; computers ignore the mouse');
  for (const label of ['ABOUT', 'PROJECTS', 'CONTACT']) {
    await page
      .getByRole('navigation', { name: 'Main menu' })
      .getByRole('button', { name: label })
      .click({ trial: true });
    await page.keyboard.press(
      label === 'ABOUT' ? 'Home' : label === 'CONTACT' ? 'End' : 'ArrowDown',
    );
    const cta = page.getByRole('link', { name: /^Enter / });
    // trial: run every actionability check (incl. "receives events") without clicking.
    await cta.click({ trial: true, timeout: 3000 });
  }
});
