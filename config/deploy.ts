export interface DeployTarget {
  /** Path the site is served from, with a trailing slash. */
  base: string;
  /** Absolute URL of the site's home page (for canonical + link previews). */
  siteUrl: string;
}

// Stub: implemented in the green step.
export function resolveDeploy(env: Record<string, string | undefined>): DeployTarget {
  void env;
  return { base: '/portfolio/', siteUrl: 'https://abeikud.github.io/portfolio/' };
}
