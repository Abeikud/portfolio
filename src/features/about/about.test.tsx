import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatRange } from '../../content/format';
import { resume } from '../../content/resume';
import { renderApp } from '../../test/renderWithRouter';
import { latestNews } from './latestNews';

describe('latestNews', () => {
  it('has one item per role, most recently active first, linking to the role', () => {
    const news = latestNews(resume);

    // Ordered by end date: Buchanan (to Aug 2026) is newer than Amobys (to Apr 2026).
    expect(news.map((n) => n.id)).toEqual([
      'gov-pei-summer-student',
      'buchanan-technical-support-analyst',
      'amobys-software-engineer-intern',
      'upei-teaching-assistant',
    ]);
    expect(news.map((n) => n.to)).toEqual(news.map((n) => `/experience/${n.id}`));
    expect(news[0]).toMatchObject({
      when: formatRange(resume.experience[0]!.dates),
      headline: `${resume.experience[0]!.title} · ${resume.experience[0]!.company}`,
      summary: resume.experience[0]!.bullets[0],
    });
  });

  it('orders by end date, so an ongoing role comes first', () => {
    const ongoing = {
      ...resume,
      experience: [
        ...resume.experience,
        {
          id: 'now',
          title: 'Now',
          company: 'Somewhere',
          dates: { start: { year: 2020, month: 1 }, end: 'present' as const },
          stack: ['x'],
          bullets: ['y'],
        },
      ],
    };
    expect(latestNews(ongoing)[0]!.id).toBe('now');
  });
});

describe('About screen', () => {
  it('introduces Daniel with the bio and location', () => {
    renderApp('/about');

    expect(screen.getByRole('heading', { level: 1, name: 'ABOUT' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: resume.profile.name }),
    ).toBeInTheDocument();
    for (const paragraph of resume.profile.bio) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.getByText(resume.profile.location)).toBeInTheDocument();
  });

  it('shows the latest news as links to each role', () => {
    renderApp('/about');
    const news = screen.getByRole('list', { name: 'Latest news' });
    const links = within(news).getAllByRole('link');

    expect(links.map((l) => l.getAttribute('href'))).toEqual(latestNews(resume).map((n) => n.to));
  });
});
