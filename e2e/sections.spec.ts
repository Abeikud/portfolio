import { expect, test } from '@playwright/test';

test('About shows the bio and links its news to roles', async ({ page, isMobile }) => {
  await page.goto('about');
  await expect(page.getByRole('heading', { level: 2, name: 'Daniel Dampson' })).toBeVisible();
  const firstNews = page.getByRole('list', { name: 'Latest news' }).getByRole('link').first();

  if (isMobile) {
    await firstNews.tap();
  } else {
    // Focus starts on the title; Tab reaches the first news item.
    await page.keyboard.press('Tab');
    await expect(firstNews).toBeFocused();
    await page.keyboard.press('Enter');
  }

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

test('the resume opens as a PDF in a new tab', async ({ page, request }) => {
  await page.goto('contact');
  const resume = page.getByRole('link', { name: /Resume/ });

  await expect(resume).toHaveAttribute('target', '_blank');
  await expect(resume).not.toHaveAttribute('download');
  const res = await request.get((await resume.getAttribute('href'))!);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('application/pdf');
});

test('Contact cards: arrow keys move, Enter opens the resume in a new tab', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(isMobile, 'keyboard');
  await page.goto('contact');
  const cards = page.getByRole('list', { name: 'Ways to reach me' });
  await expect(cards).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(cards.getByRole('link', { name: /LinkedIn/ })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(cards.getByRole('link', { name: /Resume/ })).toBeFocused();

  // Headless Chromium has no PDF viewer, so assert on the new tab's request.
  const [newTab, pdf] = await Promise.all([
    context.waitForEvent('page'),
    context.waitForEvent('request', (r) => /DDAMPSON_RESUME\.pdf$/.test(r.url())),
    page.keyboard.press('Enter'),
  ]);
  expect(pdf.frame().page()).toBe(newTab);
  await expect(page).toHaveURL(/\/portfolio\/contact$/);
});

test('Contact links are real', async ({ page }) => {
  await page.goto('contact');
  await expect(page.getByRole('link', { name: /Email/ })).toHaveAttribute('href', /^mailto:/);
  await expect(page.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/Abeikud',
  );
});
