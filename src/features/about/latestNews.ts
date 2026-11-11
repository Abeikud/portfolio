import { formatRange } from '../../content/format';
import type { Resume, Role, YearMonth } from '../../content/types';

export interface NewsItem {
  id: string;
  /** e.g. "Jun 2026 – Sep 2026" */
  when: string;
  headline: string;
  summary: string;
  to: string;
}

const months = ({ year, month }: YearMonth) => year * 12 + month;
const endOf = (role: Role) =>
  role.dates.end === 'present' ? Number.POSITIVE_INFINITY : months(role.dates.end);

/** "What I've been up to": one item per role, most recently active first. */
export function latestNews(resume: Resume): NewsItem[] {
  return [...resume.experience]
    .sort((a, b) => endOf(b) - endOf(a) || months(b.dates.start) - months(a.dates.start))
    .map((role) => ({
      id: role.id,
      when: formatRange(role.dates),
      headline: `${role.title} · ${role.company}`,
      summary: role.bullets[0] ?? '',
      to: `/experience/${role.id}`,
    }));
}
