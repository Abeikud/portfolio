import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { formatRange } from '../../content/format';
import { resume } from '../../content/resume';
import { renderApp } from '../../test/renderWithRouter';

const roles = resume.experience;
const tileLabel = (r: (typeof roles)[number]) => r.title;
const tiles = () => screen.getByRole('list', { name: 'Roles' });
const tile = (name: string) => within(tiles()).getByRole('link', { name });

describe('Experience hub', () => {
  it('shows a tile per role, newest first, with its dates', () => {
    renderApp('/experience');

    expect(
      within(tiles())
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(roles.map(tileLabel));
    for (const role of roles) {
      expect(tile(tileLabel(role))).toHaveAccessibleDescription(
        expect.stringContaining(formatRange(role.dates)),
      );
      expect(tile(tileLabel(role))).toHaveAccessibleDescription(
        expect.stringContaining(role.company),
      );
    }
  });

  it('opens the selected role with Enter', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/experience');

    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { level: 1, name: roles[0]!.title })).toHaveFocus();
    expect(router.state.location.pathname).toBe(`/experience/${roles[0]!.id}`);
  });

  it('coming back from a role re-selects and focuses its tile', async () => {
    const user = userEvent.setup();
    renderApp('/experience');
    await user.click(tile(tileLabel(roles[1]!)));
    await screen.findByRole('heading', { level: 1, name: roles[1]!.title });

    await user.keyboard('{Escape}');

    await waitFor(() => expect(tile(tileLabel(roles[1]!))).toHaveFocus());
    expect(tile(tileLabel(roles[1]!)).closest('li')).toHaveAttribute('data-selected', 'true');
  });
});

describe('Role detail', () => {
  it.each(roles.map((r) => [r.id, r] as const))(
    '%s shows the company, dates, every bullet and the stack',
    async (_, role) => {
      renderApp(`/experience/${role.id}`);

      expect(screen.getByRole('heading', { level: 1, name: role.title })).toBeInTheDocument();
      expect(screen.getByText(role.company)).toBeInTheDocument();
      if (role.team) expect(screen.getByText(role.team)).toBeInTheDocument();
      expect(screen.getByText(formatRange(role.dates))).toBeInTheDocument();
      for (const bullet of role.bullets) expect(screen.getByText(bullet)).toBeInTheDocument();
      expect(
        within(screen.getByRole('list', { name: 'Tech stack' }))
          .getAllByRole('listitem')
          .map((li) => li.textContent),
      ).toEqual(role.stack);
      await waitFor(() => expect(document.title).toBe(`${role.title} | Daniel Dampson`));
    },
  );

  it('has a breadcrumb trail through Experience', () => {
    renderApp(`/experience/${roles[0]!.id}`);
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumbs).getByRole('link', { name: 'Experience' })).toHaveAttribute(
      'href',
      '/experience',
    );
  });

  it('a deep link’s Back goes to the Experience hub, on that role', async () => {
    const user = userEvent.setup();
    const { router } = renderApp(`/experience/${roles[2]!.id}`);

    await user.keyboard('{Escape}');

    await waitFor(() => expect(router.state.location.pathname).toBe('/experience'));
    await waitFor(() => expect(tile(tileLabel(roles[2]!))).toHaveFocus());
  });

  it('an unknown role shows the not-found screen', () => {
    renderApp('/experience/no-such-role');
    expect(screen.getByRole('heading', { level: 1, name: 'PAGE NOT FOUND' })).toBeInTheDocument();
  });
});
