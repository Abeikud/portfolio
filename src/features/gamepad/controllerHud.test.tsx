import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { setInputMode } from '../../app/inputMode';
import { renderApp } from '../../test/renderWithRouter';

const controls = () => within(screen.getByRole('group', { name: 'Controls' }));
const usePad = () => act(() => setInputMode('pad'));

afterEach(() => {
  act(() => setInputMode('keys'));
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [] });
});

describe('prompts follow the controller', () => {
  it('the menu shows keyboard keys until a controller is used', async () => {
    renderApp('/');
    expect(controls().getByText('⏎')).toBeInTheDocument();
    expect(controls().queryByText('A')).toBeNull();

    await usePad();
    expect(controls().getByText('A')).toBeInTheDocument();
    expect(controls().queryByText('⏎')).toBeNull();
  });

  it('screens show B for Back and the shoulder buttons for tabs', async () => {
    renderApp('/projects');
    await usePad();

    expect(controls().getByRole('button', { name: /back/i })).toHaveTextContent('B');
    expect(controls().getByText('LB')).toBeInTheDocument();
    expect(controls().getByText('RB')).toBeInTheDocument();
    expect(screen.getAllByText('LB')).toHaveLength(2); // the tab bar's shoulder hints too
  });

  it('switches back to keys when the keyboard is used again', async () => {
    renderApp('/projects');
    await usePad();
    await act(() => setInputMode('keys'));
    expect(controls().getByRole('button', { name: /back/i })).toHaveTextContent('Esc');
    expect(controls().getByText('Q')).toBeInTheDocument();
  });
});

describe('controller chip', () => {
  it('appears while a controller is connected', async () => {
    let pads: unknown[] = [];
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => pads });
    renderApp('/');
    expect(screen.queryByRole('status', { name: 'Controller connected' })).toBeNull();

    await act(async () => {
      pads = [{ mapping: 'standard', axes: [0, 0], buttons: [{ pressed: false }] }];
      window.dispatchEvent(new Event('gamepadconnected'));
    });
    expect(screen.getByRole('status', { name: 'Controller connected' })).toBeInTheDocument();

    await act(async () => {
      pads = [];
      window.dispatchEvent(new Event('gamepaddisconnected'));
    });
    expect(screen.queryByRole('status', { name: 'Controller connected' })).toBeNull();
  });
});
