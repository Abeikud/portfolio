import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { sections } from '../content/sections';
import { renderApp } from '../test/renderWithRouter';

const menu = () => screen.getByRole('navigation', { name: 'Main menu' });
const item = (label: string) => within(menu()).getByRole('button', { name: label });
const screenHeading = (label: string) => screen.getByRole('heading', { level: 1, name: label });

describe('navigation', () => {
  it('shows the main menu at / with the site title', async () => {
    renderApp('/');

    expect(menu()).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Daniel Dampson | Portfolio'));
  });

  it('Enter opens the selected section and moves focus to its heading', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/');

    await user.keyboard('{ArrowDown}{Enter}');

    expect(await screen.findByRole('heading', { level: 1, name: 'PROJECTS' })).toHaveFocus();
    expect(router.state.location.pathname).toBe('/projects');
  });

  it('the preview’s Enter button opens the section too', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.click(screen.getByRole('link', { name: 'Enter About' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'ABOUT' })).toBeInTheDocument();
  });

  it.each(['{Escape}', '{Backspace}'])(
    '%s goes back to the menu with the same item selected and focused',
    async (key) => {
      const user = userEvent.setup();
      const { router } = renderApp('/');
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      await screen.findByRole('heading', { level: 1, name: 'EXPERIENCE' });

      await user.keyboard(key);

      await waitFor(() => expect(item('EXPERIENCE')).toHaveFocus());
      expect(item('EXPERIENCE')).toHaveAttribute('aria-current', 'true');
      expect(router.state.location.pathname).toBe('/');
    },
  );

  it('the on-screen Back prompt does the same', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.keyboard('{End}{Enter}');
    await screen.findByRole('heading', { level: 1, name: 'CONTACT' });

    await user.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => expect(item('CONTACT')).toHaveFocus());
    expect(item('CONTACT')).toHaveAttribute('aria-current', 'true');
  });

  it('a deep link opens the screen directly, and Back lands on its menu item', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/education');
    expect(screenHeading('EDUCATION')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(item('EDUCATION')).toHaveFocus());
    expect(item('EDUCATION')).toHaveAttribute('aria-current', 'true');
    expect(router.state.location.pathname).toBe('/');
  });

  it('screens have a breadcrumb back to the main menu', async () => {
    const user = userEvent.setup();
    renderApp('/skills');
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });

    expect(within(crumbs).getByText('Skills')).toHaveAttribute('aria-current', 'page');
    await user.click(within(crumbs).getByRole('link', { name: 'Main menu' }));

    expect(await screen.findByRole('navigation', { name: 'Main menu' })).toBeInTheDocument();
  });

  it.each(sections.map((s) => [s.route, s] as const))(
    '%s shows its title, intro and document title',
    async (route, section) => {
      renderApp(route);

      expect(screenHeading(section.label)).toBeInTheDocument();
      expect(screen.getByText(section.preview.blurb)).toBeInTheDocument();
      await waitFor(() =>
        expect(document.title).toBe(`${section.preview.kicker} | Daniel Dampson`),
      );
    },
  );

  it('unknown routes show a not-found screen with a way back', async () => {
    const user = userEvent.setup();
    renderApp('/no-such-page');

    expect(screenHeading('PAGE NOT FOUND')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Not found | Daniel Dampson'));

    await user.click(screen.getByRole('link', { name: 'Back to main menu' }));
    expect(await screen.findByRole('navigation', { name: 'Main menu' })).toBeInTheDocument();
  });
});
