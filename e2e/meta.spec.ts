import { expect, test } from '@playwright/test';

const SITE = 'https://abeikud.github.io/portfolio/';

test('ships a description, social preview and icons', async ({ page, request }) => {
  await page.goto('./');
  const meta = (selector: string) => page.locator(selector).first();

  await expect(meta('meta[name="description"]')).toHaveAttribute('content', /Daniel Dampson/);
  await expect(meta('meta[property="og:title"]')).toHaveAttribute('content', /Daniel Dampson/);
  await expect(meta('meta[property="og:url"]')).toHaveAttribute('content', SITE);
  await expect(meta('meta[property="og:image"]')).toHaveAttribute('content', `${SITE}og.jpg`);
  await expect(meta('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(meta('link[rel="canonical"]')).toHaveAttribute('href', SITE);

  for (const asset of ['og.jpg', 'favicon.svg', 'apple-touch-icon.png']) {
    const res = await request.get(asset);
    expect(res.status(), asset).toBe(200);
  }
});
