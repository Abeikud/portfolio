import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { resume } from '../../content/resume';
import { renderApp } from '../../test/renderWithRouter';

const cards = () =>
  within(screen.getByRole('list', { name: 'Skills' }))
    .getAllByRole('listitem')
    .map((li) => li.getAttribute('aria-label'));

describe('Skills screen', () => {
  it('has a tab per skill category, the first one active', () => {
    renderApp('/skills');

    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Languages',
      'Frameworks',
      'Data & Cloud',
      'Tools',
    ]);
    expect(screen.getByRole('tab', { name: 'Languages' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows each category’s skills, and only those, under its tab', async () => {
    const user = userEvent.setup();
    renderApp('/skills');

    for (const [i, category] of resume.skills.entries()) {
      await user.click(screen.getAllByRole('tab')[i]!);
      expect(cards()).toEqual(category.skills);
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName(
        screen.getAllByRole('tab')[i]!.textContent!,
      );
    }
  });

  it('every skill appears in exactly one tab', async () => {
    const user = userEvent.setup();
    renderApp('/skills');
    const seen: string[] = [];

    for (const tab of screen.getAllByRole('tab')) {
      await user.click(tab);
      seen.push(...(cards() as string[]));
    }

    expect(seen.sort()).toEqual(resume.skills.flatMap((c) => c.skills).sort());
  });

  it('switches categories with Q / E', async () => {
    const user = userEvent.setup();
    renderApp('/skills');

    await user.keyboard('e');

    expect(screen.getByRole('tab', { name: 'Frameworks' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(cards()).toEqual(resume.skills[1]!.skills);
  });
});
