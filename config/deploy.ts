export interface DeployTarget {
  /** Path the site is served from, with a trailing slash. */
  base: string;
  /** Absolute URL of the site's home page (for canonical + link previews). */
  siteUrl: string;
}

/** The site's main address. The old GitHub Pages URL redirects here. */
export const CANONICAL_URL = 'https://www.abeikud.com/';

const withSlashes = (path: string) => `/${path.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
const withTrailingSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`);

/**
 * Where this build will be served, from the build environment:
 * - Default: the domain root, with canonical/link previews at CANONICAL_URL
 * - Vercel (it sets VERCEL=1): link previews follow the project's production
 *   domain (VERCEL_PROJECT_PRODUCTION_URL, which is www.abeikud.com)
 * - BASE_PATH / SITE_URL override either.
 */
export function resolveDeploy(env: Record<string, string | undefined>): DeployTarget {
  const onVercel = Boolean(env.VERCEL);
  const base = withSlashes(env.BASE_PATH ?? '/');
  const vercelUrl = env.VERCEL_PROJECT_PRODUCTION_URL;
  const siteUrl = env.SITE_URL ?? (onVercel && vercelUrl ? `https://${vercelUrl}` : CANONICAL_URL);
  return { base, siteUrl: withTrailingSlash(siteUrl) };
}
