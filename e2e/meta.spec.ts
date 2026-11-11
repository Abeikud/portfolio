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

  expect((await request.get('og.jpg')).status()).toBe(200);
});

test('every icon the page declares loads and renders as the "D." monogram', async ({
  page,
  request,
}) => {
  await page.goto('./');
  const hrefs = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
  expect(hrefs.length).toBeGreaterThanOrEqual(5);
  for (const href of hrefs) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    expect(res.headers()['content-type'], href).toMatch(/^image\//);
  }

  // Draw each SVG/PNG icon in this browser engine (Chromium, or WebKit on the
  // iPhone profile) and check it is a white mark on the charcoal tile.
  const drawable = hrefs.filter((href) => /\.(svg|png)$/.test(href));
  const rendered = await page.evaluate(
    (urls) =>
      Promise.all(
        urls.map(async (url) => {
          const img = new Image();
          img.src = url;
          await img.decode();
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 64;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, 64, 64);
          const { data } = ctx.getImageData(0, 0, 64, 64);
          let white = 0;
          let tile = 0;
          for (let i = 0; i < data.length; i += 4) {
            const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
            if (a === 255 && r > 240 && g > 240 && b > 240) white++;
            if (
              a === 255 &&
              Math.abs(r - 0x17) < 8 &&
              Math.abs(g - 0x19) < 8 &&
              Math.abs(b - 0x1f) < 8
            )
              tile++;
          }
          return { url, white: white / 4096, tile: tile / 4096 };
        }),
      ),
    drawable,
  );
  for (const { url, white, tile } of rendered) {
    expect(white, url).toBeGreaterThan(0.1);
    expect(tile, url).toBeGreaterThan(0.3);
  }
});

test('the web-app manifest and its icons resolve for home-screen bookmarks', async ({
  page,
  request,
}) => {
  await page.goto('./');
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
    'content',
    'D. Dampson',
  );
  const manifestUrl = await page
    .locator('link[rel="manifest"]')
    .evaluate((link) => (link as HTMLLinkElement).href);
  const res = await request.get(manifestUrl);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toMatch(/json/);
  const manifest = (await res.json()) as { icons: { src: string }[] };
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  for (const icon of manifest.icons) {
    const iconRes = await request.get(new URL(icon.src, manifestUrl).href);
    expect(iconRes.status(), icon.src).toBe(200);
    expect(iconRes.headers()['content-type'], icon.src).toBe('image/png');
  }
});
