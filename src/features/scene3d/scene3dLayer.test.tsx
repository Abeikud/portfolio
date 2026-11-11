import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { setMediaQuery } from '../../test/matchMedia';
import { renderApp } from '../../test/renderWithRouter';

describe('3D layer in the app', () => {
  it('draws nothing where WebGL is missing (jsdom), even on a wide screen', () => {
    setMediaQuery('(min-width: 768px)', true);
    const { container } = renderApp('/');
    expect(screen.getByRole('navigation', { name: 'Main menu' })).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeNull();
  });
});

describe('3D effects setting', () => {
  it('is on by default, toggles, and is remembered', async () => {
    const user = userEvent.setup();
    const firstVisit = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    const toggle = screen.getByRole('switch', { name: '3D effects' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(JSON.parse(localStorage.getItem('dd:prefs')!)).toMatchObject({ effects3d: false });

    firstVisit.unmount();
    renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('switch', { name: '3D effects' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});
