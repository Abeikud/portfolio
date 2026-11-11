import type { Resume } from '../../content/types';

export interface NewsItem {
  id: string;
  /** e.g. "Jun 2026 – Sep 2026" */
  when: string;
  headline: string;
  summary: string;
  to: string;
}

// Stub: implemented in the green step of Phase 8.
export function latestNews(resume: Resume): NewsItem[] {
  void resume;
  return [];
}
