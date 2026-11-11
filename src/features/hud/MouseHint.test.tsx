import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setMediaQuery } from '../../test/matchMedia';
import { MOUSE_QUERY, MouseHint } from './MouseHint';

const hint = () => screen.queryByRole('status', { name: 'Keyboard controls' });

describe('MouseHint', () => {
  afterEach(() => vi.useRealTimers());

  it('on a computer, a mouse click shows how to play with the keyboard', () => {
    setMediaQuery(MOUSE_QUERY, true);
    render(<MouseHint />);
    expect(hint()).toBeNull();

    fireEvent.pointerDown(window, { pointerType: 'mouse' });

    expect(hint()).toHaveTextContent(/keyboard/i);
    expect(hint()).toHaveTextContent(/Enter/);
    expect(hint()).toHaveTextContent(/Esc/);
  });

  it('stays out of the way on touch screens', () => {
    setMediaQuery(MOUSE_QUERY, false);
    render(<MouseHint />);

    fireEvent.pointerDown(window, { pointerType: 'touch' });
    fireEvent.pointerDown(window, { pointerType: 'mouse' });

    expect(hint()).toBeNull();
  });

  it('goes away by itself, or as soon as a key is pressed', () => {
    vi.useFakeTimers();
    setMediaQuery(MOUSE_QUERY, true);
    render(<MouseHint />);

    fireEvent.pointerDown(window, { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(7000));
    expect(hint()).toBeNull();

    fireEvent.pointerDown(window, { pointerType: 'mouse' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(hint()).toBeNull();
  });
});
