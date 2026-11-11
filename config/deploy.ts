export interface DeployTarget {
  /** Path the site is served from, with a trailing slash. */
  base: string;
  /** Absolute URL of the site's home page (for canonical + link previews). */
  siteUrl: string;
}

const PAGES_URL = 'https://abeikud.github.io/portfolio/';

const withSlashes = (path: string) => `/${path.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
const withTrailingSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`);

/**
 * Where this build will be served, from the build environment:
 * - GitHub Pages (default): https://abeikud.github.io/portfolio/
 * - Vercel (it sets VERCEL=1): the domain root, with link previews pointing at
 *   the project's production domain (VERCEL_PROJECT_PRODUCTION_URL)
 * - BASE_PATH / SITE_URL override either (e.g. a custom domain).
 */
export function resolveDeploy(env: Record<string, string | undefined>): DeployTarget {
  const onVercel = Boolean(env.VERCEL);
  const base = withSlashes(env.BASE_PATH ?? (onVercel ? '/' : '/portfolio/'));
  const vercelUrl = env.VERCEL_PROJECT_PRODUCTION_URL;
  const siteUrl = env.SITE_URL ?? (onVercel && vercelUrl ? `https://${vercelUrl}` : PAGES_URL);
  return { base, siteUrl: withTrailingSlash(siteUrl) };
}
