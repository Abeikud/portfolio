import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useMenuKeyboard } from './useMenuKeyboard';

describe('useMenuKeyboard', () => {
  it('reports an intent for each mapped key pressed anywhere on the page', async () => {
    const user = userEvent.setup();
    const onIntent = vi.fn();
    renderHook(() => useMenuKeyboard(onIntent));

    await user.keyboard('{ArrowDown}s{ArrowUp}w{Home}{End}{Enter}');

    expect(onIntent.mock.calls.map(([intent]) => intent)).toEqual([
      'next',
      'next',
      'prev',
      'prev',
      'first',
      'last',
      'activate',
    ]);
  });

  it('prevents the default page scroll for keys it handles, and only those', () => {
    renderHook(() => useMenuKeyboard(vi.fn()));

    // fireEvent returns false when the listener called preventDefault().
    expect(fireEvent.keyDown(window, { key: 'ArrowDown' })).toBe(false);
    expect(fireEvent.keyDown(window, { key: ' ' })).toBe(false);
    expect(fireEvent.keyDown(window, { key: 'x' })).toBe(true);
  });

  it('does nothing while disabled', async () => {
    const user = userEvent.setup();
    const onIntent = vi.fn();
    renderHook(() => useMenuKeyboard(onIntent, { enabled: false }));

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onIntent).not.toHaveBeenCalled();
  });

  it('ignores typing in a text field', async () => {
    const user = userEvent.setup();
    const onIntent = vi.fn();
    function Harness() {
      useMenuKeyboard(onIntent);
      return <input aria-label="Search" />;
    }
    render(<Harness />);

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'ws{ArrowDown}');

    expect(onIntent).not.toHaveBeenCalled();
  });

  it('stops listening after unmount', async () => {
    const user = userEvent.setup();
    const onIntent = vi.fn();
    const { unmount } = renderHook(() => useMenuKeyboard(onIntent));

    unmount();
    await user.keyboard('{ArrowDown}');

    expect(onIntent).not.toHaveBeenCalled();
  });

  it('always calls the latest callback without re-subscribing', async () => {
    const user = userEvent.setup();
    const first = vi.fn();
    const second = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const { rerender } = renderHook(({ cb }) => useMenuKeyboard(cb), {
      initialProps: { cb: first },
    });
    const subscriptions = addSpy.mock.calls.filter(([type]) => type === 'keydown').length;

    rerender({ cb: second });
    await user.keyboard('{ArrowDown}');

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('next');
    expect(addSpy.mock.calls.filter(([type]) => type === 'keydown').length).toBe(subscriptions);
  });
});
