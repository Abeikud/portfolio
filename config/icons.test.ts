import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

// The "D." monogram icon set (built by `npm run icons`) and how index.html
// and the web-app manifest point at it.
const PUBLIC = 'public';
const TILE = { r: 0x17, g: 0x19, b: 0x1f }; // #17191F
const html = readFileSync('index.html', 'utf8');

type Attrs = Record<string, string>;
const tags = (name: string): Attrs[] =>
  [...html.matchAll(new RegExp(`<${name}\\s([^>]*?)/?>`, 'g'))].map(([, body]) =>
    Object.fromEntries([...body.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v])),
  );
const links = (rel: string) => tags('link').filter((link) => link.rel === rel);
const publicFile = (href: string) => join(PUBLIC, href.replace(/^\//, ''));

const pixels = async (file: string) => {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const at = (x: number, y: number) => {
    const i = (y * info.width + x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
  };
  return { ...info, at };
};
type Pixel = { r: number; g: number; b: number; a: number };
const near = (p: Pixel, c: { r: number; g: number; b: number }, tolerance = 6) =>
  p.a === 255 &&
  Math.abs(p.r - c.r) <= tolerance &&
  Math.abs(p.g - c.g) <= tolerance &&
  Math.abs(p.b - c.b) <= tolerance;
const isWhite = (p: Pixel) => p.a === 255 && p.r > 245 && p.g > 245 && p.b > 245;

describe('favicon links in index.html', () => {
  it('declares the SVG icon last so browsers that support it prefer it', () => {
    const icons = links('icon');
    expect(icons.at(-1)).toMatchObject({ type: 'image/svg+xml', href: '/favicon.svg' });
  });

  it('has PNG and ICO fallbacks for browsers without SVG favicons', () => {
    expect(links('icon')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/favicon.ico', sizes: '32x32' }),
        expect.objectContaining({ type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }),
        expect.objectContaining({ type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }),
      ]),
    );
  });

  it('has an Apple touch icon, a manifest and a home-screen title for mobile bookmarks', () => {
    expect(links('apple-touch-icon')).toEqual([
      expect.objectContaining({ sizes: '180x180', href: '/apple-touch-icon.png' }),
    ]);
    expect(links('manifest')).toEqual([expect.objectContaining({ href: '/site.webmanifest' })]);
    expect(tags('meta')).toContainEqual(
      expect.objectContaining({ name: 'apple-mobile-web-app-title', content: 'D. Dampson' }),
    );
  });

  it('points every icon link at a file that ships', () => {
    const hrefs = ['icon', 'apple-touch-icon', 'manifest'].flatMap((rel) =>
      links(rel).map((link) => link.href),
    );
    expect(hrefs.length).toBeGreaterThanOrEqual(6);
    for (const href of hrefs) expect(existsSync(publicFile(href)), href).toBe(true);
  });

  it('serves PNGs at exactly the sizes the links declare', async () => {
    for (const link of [...links('icon'), ...links('apple-touch-icon')]) {
      if (!link.href.endsWith('.png')) continue;
      const { width, height } = await sharp(publicFile(link.href)).metadata();
      expect(`${width}x${height}`, link.href).toBe(link.sizes);
    }
  });
});

describe('favicon.svg', () => {
  const svg = existsSync(join(PUBLIC, 'favicon.svg'))
    ? readFileSync(join(PUBLIC, 'favicon.svg'), 'utf8')
    : '';

  it('is a square charcoal tile with a white "D."', () => {
    expect(svg).toMatch(/viewBox="0 0 64 64"/);
    expect(svg).toMatch(/<title>D\.<\/title>/);
    expect(svg).toMatch(/<rect[^>]*fill="#17191F"/i);
    expect(svg).toMatch(/fill="#FFFFFF"/i);
  });

  it('stays minimal: flat colours only, no gradients, glow, filters, text or images', () => {
    expect(svg).not.toMatch(/Gradient|<filter|<fe[A-Z]|blur|opacity|<text|<image|<script|<style/i);
    expect(svg).not.toContain('#3cf2a6'); // the old accent-green mark
    expect(svg.length).toBeLessThan(4 * 1024);
  });

  it('gets its depth from a solid extrusion behind the letters', () => {
    expect(svg.match(/<use href="#m" x="[\d.]+" y="[\d.]+"\/>/g)?.length).toBeGreaterThan(4);
  });
});

describe('rendered icons', () => {
  it('reads as a white mark on the charcoal tile at 16 and 32 px', async () => {
    for (const file of ['favicon-16x16.png', 'favicon-32x32.png']) {
      const img = await pixels(join(PUBLIC, file));
      const all = Array.from({ length: img.width * img.height }, (_, i) =>
        img.at(i % img.width, Math.floor(i / img.width)),
      );
      const white = all.filter(isWhite).length / all.length;
      const tile = all.filter((p) => near(p, TILE)).length / all.length;
      expect(white, file).toBeGreaterThan(0.12);
      expect(tile, file).toBeGreaterThan(0.3);
    }
  });

  it('gives iOS an opaque, full-bleed 180 px icon (no transparent corners)', async () => {
    const meta = await sharp(join(PUBLIC, 'apple-touch-icon.png')).metadata();
    expect(meta).toMatchObject({ width: 180, height: 180, hasAlpha: false });
    const img = await pixels(join(PUBLIC, 'apple-touch-icon.png'));
    for (const [x, y] of [
      [0, 0],
      [179, 0],
      [0, 179],
      [179, 179],
    ])
      expect(near(img.at(x, y), TILE), `corner ${x},${y}`).toBe(true);
  });

  it('bundles 16, 32 and 48 px PNGs in favicon.ico', () => {
    const ico = readFileSync(join(PUBLIC, 'favicon.ico'));
    expect(ico.readUInt16LE(2)).toBe(1); // icon, not cursor
    const count = ico.readUInt16LE(4);
    const sizes = Array.from({ length: count }, (_, i) => {
      const entry = 6 + 16 * i;
      const offset = ico.readUInt32LE(entry + 12);
      expect(ico.subarray(offset, offset + 4).toString('latin1')).toBe('\x89PNG');
      return ico.readUInt8(entry);
    });
    expect(sizes).toEqual([16, 32, 48]);
  });
});

type Manifest = {
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  icons: { src: string; sizes: string; type: string; purpose?: string }[];
};
// Read lazily so a missing file fails these tests, not the whole file.
const readManifest = () =>
  JSON.parse(readFileSync(join(PUBLIC, 'site.webmanifest'), 'utf8')) as Manifest;

describe('site.webmanifest', () => {
  it('names the site and opens at whichever base path it is served from', () => {
    const manifest = readManifest();
    expect(manifest).toMatchObject({
      name: 'Daniel Dampson | Portfolio',
      short_name: 'D. Dampson',
      start_url: '.',
      scope: '.',
    });
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('lists 192 and 512 px icons plus a maskable one, by relative path', async () => {
    const manifest = readManifest();
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: '192x192', purpose: 'any' }),
        expect.objectContaining({ sizes: '512x512', purpose: 'any' }),
        expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
      ]),
    );
    for (const icon of manifest.icons) {
      // Relative so it works under /portfolio/ on Pages and / on Vercel.
      expect(icon.src, icon.src).not.toMatch(/^\/|^https?:/);
      expect(icon.type).toBe('image/png');
      const { width, height } = await sharp(join(PUBLIC, icon.src)).metadata();
      expect(`${width}x${height}`, icon.src).toBe(icon.sizes);
    }
  });

  it('keeps the maskable icon’s mark inside Android’s 80% safe zone', async () => {
    const src = readManifest().icons.find((icon) => icon.purpose === 'maskable')!.src;
    const img = await pixels(join(PUBLIC, src));
    const c = img.width / 2;
    const radius = img.width * 0.4;
    let outside = 0;
    for (let y = 0; y < img.height; y++)
      for (let x = 0; x < img.width; x++)
        if (Math.hypot(x + 0.5 - c, y + 0.5 - c) > radius && !near(img.at(x, y), TILE)) outside++;
    expect(outside).toBe(0);
    expect(near(img.at(0, 0), TILE)).toBe(true); // full bleed, opaque
  });
});
