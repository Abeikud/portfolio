import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getInputMode, setInputMode } from '../../app/inputMode';
import { openLink, useGamepadBridge } from './useGamepadBridge';

// A fake standard-mapping controller that tests can press buttons on.
const BUTTON = { a: 0, b: 1, lb: 4, rb: 5, up: 12, down: 13, left: 14, right: 15 };
let pads: ({ mapping: string; axes: number[]; buttons: { pressed: boolean }[] } | null)[] = [];
const fakePad = () => ({
  mapping: 'standard',
  axes: [0, 0, 0, 0],
  buttons: Array.from({ length: 17 }, () => ({ pressed: false })),
});
const hold = (name: keyof typeof BUTTON, pressed = true) => {
  pads[0]!.buttons[BUTTON[name]] = { pressed };
};
const frame = () => act(() => vi.advanceTimersByTime(20));
const connect = () =>
  act(() => {
    pads = [fakePad()];
    window.dispatchEvent(new Event('gamepadconnected'));
  });
const disconnect = () =>
  act(() => {
    pads = [];
    window.dispatchEvent(new Event('gamepaddisconnected'));
  });
async function press(name: keyof typeof BUTTON) {
  hold(name);
  await frame();
  hold(name, false);
  await frame();
}

function Harness({ onClick = () => {} }: { onClick?: () => void }) {
  const { connected } = useGamepadBridge();
  return (
    <>
      <p>{connected ? 'pad on' : 'pad off'}</p>
      <button type="button" onClick={onClick}>
        Target
      </button>
    </>
  );
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout'],
  });
  pads = [];
  Object.defineProperty(navigator, 'getGamepads', {
    configurable: true,
    value: () => pads,
  });
  setInputMode('keys');
});
afterEach(() => {
  vi.useRealTimers();
});

describe('useGamepadBridge', () => {
  it('knows when a controller is connected or unplugged', async () => {
    render(<Harness />);
    expect(screen.getByText('pad off')).toBeInTheDocument();
    await connect();
    expect(screen.getByText('pad on')).toBeInTheDocument();
    await disconnect();
    expect(screen.getByText('pad off')).toBeInTheDocument();
  });

  it('turns buttons into the keys the page already listens for', async () => {
    const keys: string[] = [];
    const listener = (event: KeyboardEvent) => keys.push(event.key);
    window.addEventListener('keydown', listener);
    render(<Harness />);
    await connect();

    for (const name of ['up', 'down', 'left', 'right', 'b', 'lb', 'rb'] as const) await press(name);
    expect(keys).toEqual(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'q', 'e']);
    window.removeEventListener('keydown', listener);
  });

  it('sends keys to the focused element so local handlers see them too', async () => {
    const onKey = vi.fn();
    render(<Harness />);
    const target = screen.getByRole('button', { name: 'Target' });
    target.addEventListener('keydown', (event) => onKey(event.key));
    target.focus();
    await connect();
    await press('down');
    expect(onKey).toHaveBeenCalledWith('ArrowDown');
  });

  it('A clicks the focused button, like Enter does', async () => {
    const onClick = vi.fn();
    render(<Harness onClick={onClick} />);
    screen.getByRole('button', { name: 'Target' }).focus();
    await connect();
    await press('a');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('A does not click when a handler already used the Enter key', async () => {
    const onClick = vi.fn();
    const handled = (event: KeyboardEvent) => event.preventDefault();
    window.addEventListener('keydown', handled);
    render(<Harness onClick={onClick} />);
    screen.getByRole('button', { name: 'Target' }).focus();
    await connect();
    await press('a');
    expect(onClick).not.toHaveBeenCalled();
    window.removeEventListener('keydown', handled);
  });

  it('stops polling once the controller is unplugged', async () => {
    const keys: string[] = [];
    const listener = (event: KeyboardEvent) => keys.push(event.key);
    window.addEventListener('keydown', listener);
    render(<Harness />);
    await connect();
    const unplugged = pads[0]!;
    await disconnect();
    unplugged.buttons[BUTTON.a] = { pressed: true };
    pads = [unplugged]; // even if the browser still lists it, nothing fires
    await frame();
    expect(keys).toEqual([]);
    window.removeEventListener('keydown', listener);
  });

  it('switches the prompts to controller buttons, and back on a real key', async () => {
    render(<Harness />);
    await connect();
    await press('down');
    expect(getInputMode()).toBe('pad');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(getInputMode()).toBe('keys');
  });
});

describe('openLink', () => {
  const anchor = (attrs: Record<string, string>) => {
    const a = document.createElement('a');
    for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
    return a;
  };

  it('opens new-tab links in a new tab when the browser allows it', () => {
    const tab = { opener: window } as unknown as Window;
    const open = vi.fn(() => tab);
    const assign = vi.fn();
    openLink(anchor({ href: 'https://github.com/Abeikud', target: '_blank' }), { open, assign });
    expect(open).toHaveBeenCalledWith('https://github.com/Abeikud', '_blank');
    expect(tab.opener).toBeNull();
    expect(assign).not.toHaveBeenCalled();
  });

  it('falls back to the same tab when the new tab is blocked', () => {
    const assign = vi.fn();
    openLink(anchor({ href: 'https://github.com/Abeikud', target: '_blank' }), {
      open: () => null,
      assign,
    });
    expect(assign).toHaveBeenCalledWith('https://github.com/Abeikud');
  });

  it('clicks ordinary links so in-app navigation still works', () => {
    const link = anchor({ href: '/projects' });
    const click = vi.spyOn(link, 'click').mockImplementation(() => {});
    openLink(link, { open: vi.fn(), assign: vi.fn() });
    expect(click).toHaveBeenCalledOnce();
  });
});
