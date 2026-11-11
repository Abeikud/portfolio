import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sections } from '../../content/sections';
import { setMediaQuery } from '../../test/matchMedia';
import { renderApp } from '../../test/renderWithRouter';

const hud = () => screen.getByRole('progressbar', { name: 'Sections explored' });
const controls = () => within(screen.getByRole('group', { name: 'Controls' }));

describe('Explored HUD', () => {
  it('starts at 0 of 7', () => {
    renderApp('/');

    expect(hud()).toHaveAttribute('aria-valuenow', '0');
    expect(hud()).toHaveAttribute('aria-valuemax', String(sections.length));
    expect(screen.getByText('EXPLORED 0/7')).toBeInTheDocument();
  });

  it('counts each section once, including through its detail pages', async () => {
    const { router } = renderApp('/skills');
    expect(hud()).toHaveAttribute('aria-valuenow', '1');

    await act(() => router.navigate('/'));
    await act(() => router.navigate('/skills'));
    expect(hud()).toHaveAttribute('aria-valuenow', '1');

    await act(() => router.navigate('/projects/startingfive'));
    expect(hud()).toHaveAttribute('aria-valuenow', '2');
  });

  it('remembers progress across visits', () => {
    const first = renderApp('/education');
    first.unmount();

    renderApp('/');
    expect(hud()).toHaveAttribute('aria-valuenow', '1');
  });

  describe('when storage is blocked', () => {
    afterEach(() => vi.restoreAllMocks());

    it('still works for the current visit', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      renderApp('/contact');

      expect(screen.getByRole('heading', { level: 1, name: 'CONTACT' })).toBeInTheDocument();
      expect(hud()).toHaveAttribute('aria-valuenow', '1');
    });
  });
});

describe('Season objective toast', () => {
  it('invites a first-time visitor to explore, and stays dismissed', async () => {
    const user = userEvent.setup();
    const first = renderApp('/');
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent(/explore all 7 sections/i);

    await user.click(within(toast).getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText(/explore all 7 sections/i)).toBeNull();

    first.unmount();
    renderApp('/');
    expect(screen.queryByText(/explore all 7 sections/i)).toBeNull();
  });

  it('celebrates 7/7 with a link to Contact', async () => {
    const { router } = renderApp('/');

    for (const section of sections) await act(() => router.navigate(section.route));
    await act(() => router.navigate('/'));

    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent(/objective complete/i);
    expect(within(toast).getByRole('link', { name: /let’s talk/i })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(hud()).toHaveAttribute('aria-valuenow', '7');
  });
});

describe('Key prompts', () => {
  it('the menu shows its controls', () => {
    renderApp('/');
    expect(controls().getByText('Navigate')).toBeInTheDocument();
    expect(controls().getByText('Select')).toBeInTheDocument();
  });

  it('hubs with tabs show the tab, move and open controls', () => {
    renderApp('/projects');
    for (const label of ['Tabs', 'Move', 'Open']) {
      expect(controls().getByText(label)).toBeInTheDocument();
    }
    expect(controls().getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('detail pages only offer Back', () => {
    renderApp('/projects/startingfive');
    expect(controls().queryByText('Tabs')).toBeNull();
    expect(controls().getByRole('button', { name: /back/i })).toBeInTheDocument();
  });
});

describe('Settings', () => {
  it('has a Reduce motion switch that stops the scene drift and persists', async () => {
    const user = userEvent.setup();
    const first = renderApp('/');

    const gear = screen.getByRole('button', { name: 'Settings' });
    expect(gear).toHaveAttribute('aria-expanded', 'false');
    await user.click(gear);
    expect(gear).toHaveAttribute('aria-expanded', 'true');

    const toggle = screen.getByRole('switch', { name: 'Reduce motion' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.dataset.motion).toBe('reduced');
    expect(document.querySelector('[data-drift]')).toHaveAttribute('data-drift', 'false');

    first.unmount();
    renderApp('/');
    await waitFor(() => expect(document.documentElement.dataset.motion).toBe('reduced'));
  });

  it('closes with Escape and returns focus to the gear', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const gear = screen.getByRole('button', { name: 'Settings' });
    await user.click(gear);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('switch', { name: 'Reduce motion' })).toBeNull();
    expect(gear).toHaveFocus();
  });
});

describe('Mouse on a computer', () => {
  it('a click does nothing, not even a pop-up guide', () => {
    setMediaQuery('(hover: hover) and (pointer: fine)', true);
    renderApp('/');

    fireEvent.pointerDown(window, { pointerType: 'mouse' });

    expect(screen.queryByRole('status', { name: 'Keyboard controls' })).toBeNull();
  });
});
