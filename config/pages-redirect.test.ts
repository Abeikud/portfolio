import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { CANONICAL_URL } from './deploy';

// GitHub Pages no longer hosts the app. It serves pages-redirect/index.html
// (as index.html and 404.html) for every old abeikud.github.io/portfolio URL.
const page = () => readFileSync('pages-redirect/index.html', 'utf8');

/** Runs the page's inline script against a fake `location`. */
function redirectFrom(oldUrl: string) {
  const { pathname, search, hash } = new URL(oldUrl, 'https://abeikud.github.io');
  const replace = vi.fn();
  const script = page().match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
  new Function('location', script)({ pathname, search, hash, replace });
  expect(replace).toHaveBeenCalledOnce();
  return replace.mock.calls[0][0] as string;
}

describe('the old GitHub Pages address', () => {
  it.each([
    ['/portfolio/', 'https://www.abeikud.com/'],
    ['/portfolio', 'https://www.abeikud.com/'],
    ['/portfolio/index.html', 'https://www.abeikud.com/'],
    ['/portfolio/projects/startingfive', 'https://www.abeikud.com/projects/startingfive'],
    ['/portfolio/contact?ref=linkedin#top', 'https://www.abeikud.com/contact?ref=linkedin#top'],
    ['/portfolio/DDAMPSON_RESUME.pdf', 'https://www.abeikud.com/DDAMPSON_RESUME.pdf'],
  ])('sends %s to the same page on the domain', (from, to) => {
    expect(redirectFrom(from)).toBe(to);
  });

  it('points only at the canonical domain', () => {
    const html = page();
    const urls = html.match(/https:\/\/[^\s"'<)]+/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url.startsWith(CANONICAL_URL.slice(0, -1)), url).toBe(true);
    expect(html).toContain(`<link rel="canonical" href="${CANONICAL_URL}" />`);
  });

  it('still forwards without JavaScript, and shows a link while it does', () => {
    const html = page();
    expect(html).toMatch(
      new RegExp(`<noscript>\\s*<meta http-equiv="refresh" content="0; url=${CANONICAL_URL}" />`),
    );
    expect(html).toMatch(new RegExp(`<a href="${CANONICAL_URL}">www\\.abeikud\\.com</a>`));
  });

  it('is what the Pages workflow deploys, as both index.html and 404.html', () => {
    const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
    expect(workflow).toContain('node scripts/pages-redirect.mjs');
    expect(workflow).toMatch(/path: dist-pages/);
    expect(workflow).not.toContain('npm run build');
    const script = readFileSync('scripts/pages-redirect.mjs', 'utf8');
    expect(script).toMatch(/index\.html/);
    expect(script).toMatch(/404\.html/);
  });
});
