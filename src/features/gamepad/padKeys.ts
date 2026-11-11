/**
 * Pure controller logic: reads standard-mapping gamepads and turns button
 * presses into the keys the site already understands, with console-style
 * hold-to-repeat on the D-pad.
 */
export type PadButton = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'lb' | 'rb';
export type PadState = Readonly<Record<PadButton, boolean>>;

/** The subset of the Gamepad API this module needs (easy to fake in tests). */
export interface GamepadLike {
  mapping: string;
  axes: readonly number[];
  buttons: readonly { pressed: boolean }[];
}

/** Check order, which is also the order presses fire within one frame. */
const BUTTONS: readonly PadButton[] = ['up', 'down', 'left', 'right', 'a', 'b', 'lb', 'rb'];
const REPEATS: ReadonlySet<PadButton> = new Set(['up', 'down', 'left', 'right']);

export const IDLE: PadState = {
  up: false,
  down: false,
  left: false,
  right: false,
  a: false,
  b: false,
  lb: false,
  rb: false,
};

export const KEY_FOR: Readonly<Record<PadButton, string>> = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  a: 'Enter',
  b: 'Escape',
  lb: 'q',
  rb: 'e',
};

/** Stick travel (0–1) that counts as a push; below it is resting drift. */
export const DEADZONE = 0.5;
/** Hold a direction this long before it starts repeating… */
export const REPEAT_DELAY = 400;
/** …then repeat this often, like a held arrow key. */
export const REPEAT_EVERY = 110;

// W3C "standard" layout: 0 A/Cross, 1 B/Circle, 4 LB/L1, 5 RB/R1, 12–15 D-pad.
const STANDARD: Readonly<Record<PadButton, number>> = {
  a: 0,
  b: 1,
  lb: 4,
  rb: 5,
  up: 12,
  down: 13,
  left: 14,
  right: 15,
};

/** What a pad is holding right now. */
export function readPad(pad: GamepadLike): PadState {
  const held = (button: PadButton) => pad.buttons[STANDARD[button]]?.pressed === true;
  const x = pad.axes[0] ?? 0;
  const y = pad.axes[1] ?? 0;
  // Only the stronger axis counts, so a slightly diagonal push moves one way.
  const horizontal = Math.abs(x) >= Math.abs(y);
  const stick = (value: number, sign: 1 | -1, isHorizontal: boolean) =>
    isHorizontal === horizontal && value * sign > DEADZONE;

  return {
    up: held('up') || stick(y, -1, false),
    down: held('down') || stick(y, 1, false),
    left: held('left') || stick(x, -1, true),
    right: held('right') || stick(x, 1, true),
    a: held('a'),
    b: held('b'),
    lb: held('lb'),
    rb: held('rb'),
  };
}

/** Several connected pads act as one. */
export function mergePads(states: readonly PadState[]): PadState {
  return Object.fromEntries(
    BUTTONS.map((button) => [button, states.some((state) => state[button])]),
  ) as PadState;
}

export interface PadTracker {
  state: PadState;
  /** When each held button went down, and when it last fired. */
  held: Readonly<Partial<Record<PadButton, { since: number; fired: number }>>>;
}

export interface PadPress {
  button: PadButton;
  key: string;
  repeat: boolean;
}

export const startTracker = (): PadTracker => ({ state: IDLE, held: {} });

/** Compares this frame with the last and returns the key presses to fire. */
export function padToKeys(
  tracker: PadTracker,
  next: PadState,
  now: number,
): { tracker: PadTracker; presses: PadPress[] } {
  const presses: PadPress[] = [];
  const held: Partial<Record<PadButton, { since: number; fired: number }>> = {};

  for (const button of BUTTONS) {
    if (!next[button]) continue;
    const before = tracker.held[button];
    if (!tracker.state[button] || !before) {
      presses.push({ button, key: KEY_FOR[button], repeat: false });
      held[button] = { since: now, fired: now };
      continue;
    }
    const due = before.fired === before.since ? REPEAT_DELAY : REPEAT_EVERY;
    if (REPEATS.has(button) && now - before.fired >= due) {
      presses.push({ button, key: KEY_FOR[button], repeat: true });
      held[button] = { since: before.since, fired: now };
    } else {
      held[button] = before;
    }
  }

  return { tracker: { state: next, held }, presses };
}
