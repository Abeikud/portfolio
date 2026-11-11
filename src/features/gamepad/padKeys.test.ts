import { describe, expect, it } from 'vitest';
import {
  IDLE,
  KEY_FOR,
  REPEAT_DELAY,
  REPEAT_EVERY,
  mergePads,
  padToKeys,
  readPad,
  startTracker,
  type GamepadLike,
  type PadState,
} from './padKeys';

/** A standard-mapping pad with the given buttons held and stick position. */
function pad(held: number[] = [], axes: number[] = [0, 0, 0, 0]): GamepadLike {
  return {
    mapping: 'standard',
    axes,
    buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: held.includes(i) })),
  };
}
const state = (patch: Partial<PadState>): PadState => ({ ...IDLE, ...patch });

describe('readPad', () => {
  it('reads A, B, the shoulders and the D-pad from the standard mapping', () => {
    expect(readPad(pad([0, 1, 4, 5, 12, 15]))).toEqual({
      up: true,
      down: false,
      left: false,
      right: true,
      a: true,
      b: true,
      lb: true,
      rb: true,
    });
  });

  it('treats the left stick past the deadzone as a direction', () => {
    expect(readPad(pad([], [0, -0.9]))).toEqual(state({ up: true }));
    expect(readPad(pad([], [0.8, 0]))).toEqual(state({ right: true }));
    expect(readPad(pad([], [0.3, -0.4]))).toEqual(IDLE); // resting drift
  });

  it('uses the stronger stick axis so a slightly diagonal push moves one way', () => {
    expect(readPad(pad([], [0.6, 0.9]))).toEqual(state({ down: true }));
    expect(readPad(pad([], [-0.95, 0.55]))).toEqual(state({ left: true }));
  });

  it('copes with pads that report fewer buttons or axes', () => {
    expect(readPad({ mapping: '', axes: [], buttons: [{ pressed: true }] })).toEqual(
      state({ a: true }),
    );
  });
});

describe('mergePads', () => {
  it('combines every connected pad', () => {
    expect(mergePads([state({ up: true }), state({ a: true })])).toEqual(
      state({ up: true, a: true }),
    );
    expect(mergePads([])).toEqual(IDLE);
  });
});

describe('padToKeys', () => {
  it('maps buttons to the keys the site already understands', () => {
    expect(KEY_FOR).toEqual({
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      a: 'Enter',
      b: 'Escape',
      lb: 'q',
      rb: 'e',
    });
  });

  it('presses once when a button goes down, and not again while it is held', () => {
    let tracker = startTracker();
    let result = padToKeys(tracker, state({ a: true }), 0);
    expect(result.presses).toEqual([{ button: 'a', key: 'Enter', repeat: false }]);

    tracker = result.tracker;
    result = padToKeys(tracker, state({ a: true }), 5_000);
    expect(result.presses).toEqual([]);

    result = padToKeys(result.tracker, IDLE, 5_016);
    result = padToKeys(result.tracker, state({ a: true }), 5_032);
    expect(result.presses).toEqual([{ button: 'a', key: 'Enter', repeat: false }]);
  });

  it('repeats a held direction after a delay, then steadily', () => {
    const held = state({ down: true });
    let { tracker, presses } = padToKeys(startTracker(), held, 0);
    expect(presses).toHaveLength(1);

    const at = (now: number) => {
      const result = padToKeys(tracker, held, now);
      tracker = result.tracker;
      return result.presses.map((p) => p.repeat);
    };
    expect(at(REPEAT_DELAY - 1)).toEqual([]);
    expect(at(REPEAT_DELAY)).toEqual([true]);
    expect(at(REPEAT_DELAY + REPEAT_EVERY - 1)).toEqual([]);
    expect(at(REPEAT_DELAY + REPEAT_EVERY)).toEqual([true]);
  });

  it('fires every newly pressed button in one frame', () => {
    const { presses } = padToKeys(startTracker(), state({ up: true, rb: true }), 0);
    expect(presses.map((p) => p.key)).toEqual(['ArrowUp', 'e']);
  });
});
