import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { resume } from '../../content/resume';
import { renderApp } from '../../test/renderWithRouter';

const tiles = () => screen.getByRole('list', { name: 'Projects' });
const tileNames = () =>
  within(tiles())
    .getAllByRole('link')
    .map((l) => l.textContent);
const tile = (name: string) => within(tiles()).getByRole('link', { name });
const isSelected = (el: HTMLElement) => el.closest('li')?.dataset.selected === 'true';

describe('Projects hub', () => {
  it('shows a tile per project under the All tab', () => {
    renderApp('/projects');

    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
    expect(tileNames()).toEqual(resume.projects.map((p) => p.name));
  });

  it('filters by category with the tabs', async () => {
    const user = userEvent.setup();
    renderApp('/projects');

    await user.click(screen.getByRole('tab', { name: 'Web' }));
    expect(tileNames()).toEqual(['StartingFive', 'Portfolio Website']);

    await user.keyboard('e');
    expect(screen.getByRole('tab', { name: 'macOS' })).toHaveAttribute('aria-selected', 'true');
    expect(tileNames()).toEqual(['DIsland']);
  });

  it('labels the tile list as the active tab’s panel', async () => {
    renderApp('/projects');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAccessibleName('All');
    expect(within(panel).getByRole('list', { name: 'Projects' })).toBeInTheDocument();
  });

  it('opens the selected tile with Enter', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/projects');

    await user.keyboard('{ArrowRight}{Enter}');

    expect(await screen.findByRole('heading', { level: 1, name: 'DIsland' })).toHaveFocus();
    expect(router.state.location.pathname).toBe('/projects/disland');
  });

  it('coming back from a project re-selects and focuses its tile, on the same tab', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/projects');
    await user.click(screen.getByRole('tab', { name: 'Web' }));
    // Focus is on the tab now, where ←/→ switch tabs; ↓ drops into the tiles.
    await user.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    await screen.findByRole('heading', { level: 1, name: 'Portfolio Website' });

    await user.keyboard('{Escape}');

    await waitFor(() => expect(tile('Portfolio Website')).toHaveFocus());
    expect(isSelected(tile('Portfolio Website'))).toBe(true);
    expect(screen.getByRole('tab', { name: 'Web' })).toHaveAttribute('aria-selected', 'true');
    expect(router.state.location.pathname).toBe('/projects');
  });

  it('Esc from the hub still returns to PROJECTS in the main menu', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.keyboard('{ArrowDown}{Enter}');
    await screen.findByRole('heading', { level: 1, name: 'PROJECTS' });

    await user.keyboard('{Escape}');

    const menu = await screen.findByRole('navigation', { name: 'Main menu' });
    await waitFor(() =>
      expect(within(menu).getByRole('button', { name: 'PROJECTS' })).toHaveFocus(),
    );
  });
});

it('describes each tile with its tagline', () => {
  renderApp('/projects');
  expect(tile('StartingFive')).toHaveAccessibleDescription(
    expect.stringContaining(resume.projects[0]!.tagline),
  );
});

describe('Project detail', () => {
  it.each(resume.projects.map((p) => [p.name, p] as const))(
    '%s shows its tagline, every bullet, its stack and links',
    async (_, project) => {
      renderApp(`/projects/${project.slug}`);

      expect(screen.getByRole('heading', { level: 1, name: project.name })).toBeInTheDocument();
      expect(screen.getByText(project.tagline)).toBeInTheDocument();
      for (const bullet of project.bullets) expect(screen.getByText(bullet)).toBeInTheDocument();

      const stack = screen.getByRole('list', { name: 'Tech stack' });
      expect(
        within(stack)
          .getAllByRole('listitem')
          .map((li) => li.textContent),
      ).toEqual(project.stack);

      for (const link of project.links) {
        expect(screen.getByRole('link', { name: new RegExp(link.label) })).toHaveAttribute(
          'href',
          link.href,
        );
      }
      await waitFor(() => expect(document.title).toBe(`${project.name} | Daniel Dampson`));
    },
  );

  it('has a breadcrumb trail through Projects', () => {
    renderApp('/projects/startingfive');
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });

    expect(within(crumbs).getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(within(crumbs).getByText('StartingFive')).toHaveAttribute('aria-current', 'page');
  });

  it('opens external links in a new tab safely', () => {
    renderApp('/projects/startingfive');
    const github = screen.getByRole('link', { name: /GitHub/ });
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('a deep link’s Back goes to the Projects hub', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/projects/disland');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(router.state.location.pathname).toBe('/projects'));
    await waitFor(() => expect(tile('DIsland')).toHaveFocus());
  });

  it('an unknown project shows the not-found screen', () => {
    renderApp('/projects/no-such-project');
    expect(screen.getByRole('heading', { level: 1, name: 'PAGE NOT FOUND' })).toBeInTheDocument();
  });
});
