import { expect, test, type BrowserContext } from '@playwright/test';

// Runs against the GitHub Pages redirect build served under /portfolio/ (the
// 'pages' project). Requests to the real domain are answered locally.
const DOMAIN = 'https://www.abeikud.com';
const stubDomain = (context: BrowserContext) =>
  context.route(/^https:\/\/www\.abeikud\.com\//, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>abeikud.com</title>' }),
  );

test('old GitHub Pages links land on the same page at www.abeikud.com', async ({
  page,
  context,
}) => {
  await stubDomain(context);
  for (const [from, to] of [
    ['/portfolio/', `${DOMAIN}/`],
    ['/portfolio/projects/startingfive?ref=old#top', `${DOMAIN}/projects/startingfive?ref=old#top`],
  ]) {
    await page.goto(from, { waitUntil: 'commit' });
    await expect(page).toHaveURL(to);
    await expect(page).toHaveTitle('abeikud.com');
  }
});

test('without JavaScript the old address still forwards to the home page', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  await stubDomain(context);
  const page = await context.newPage();
  await page.goto('/portfolio/contact', { waitUntil: 'commit' });
  await expect(page).toHaveURL(`${DOMAIN}/`);
  await context.close();
});
