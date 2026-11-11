import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveDeploy } from './deploy';

describe('resolveDeploy', () => {
  it('defaults to GitHub Pages under /portfolio/', () => {
    expect(resolveDeploy({})).toEqual({
      base: '/portfolio/',
      siteUrl: 'https://abeikud.github.io/portfolio/',
    });
  });

  it('serves from the root on Vercel, with previews pointing at the production domain', () => {
    expect(
      resolveDeploy({ VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'daniel-dampson.vercel.app' }),
    ).toEqual({ base: '/', siteUrl: 'https://daniel-dampson.vercel.app/' });
  });

  it('lets BASE_PATH and SITE_URL override everything (e.g. a custom domain)', () => {
    expect(
      resolveDeploy({
        VERCEL: '1',
        VERCEL_PROJECT_PRODUCTION_URL: 'x.vercel.app',
        BASE_PATH: '/',
        SITE_URL: 'https://danieldampson.dev',
      }),
    ).toEqual({ base: '/', siteUrl: 'https://danieldampson.dev/' });
  });

  it('adds missing slashes so asset paths and URLs join correctly', () => {
    expect(resolveDeploy({ BASE_PATH: 'site', SITE_URL: 'https://a.test/site' })).toEqual({
      base: '/site/',
      siteUrl: 'https://a.test/site/',
    });
  });
});

describe('vercel.json', () => {
  const vercel = () => JSON.parse(readFileSync('vercel.json', 'utf8'));

  it('builds the Vite app into dist', () => {
    expect(vercel()).toMatchObject({
      framework: 'vite',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
    });
  });

  it('sends every client-side route to the app shell, so deep links and refreshes work', () => {
    expect(vercel().rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' });
  });

  it('caches fingerprinted assets forever', () => {
    const assets = vercel().headers.find((h: { source: string }) => h.source === '/assets/(.*)');
    expect(assets.headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    });
  });
});
