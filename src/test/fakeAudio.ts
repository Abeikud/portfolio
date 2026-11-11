import { vi } from 'vitest';

/** An AudioParam stand-in that remembers the first value it was set to. */
function param() {
  const p = {
    value: 0,
    set: false,
    setValueAtTime(value: number) {
      if (!p.set) p.value = value;
      p.set = true;
      return p;
    },
    exponentialRampToValueAtTime: () => p,
    linearRampToValueAtTime: () => p,
  };
  return p;
}

/**
 * A Web Audio stand-in for tests: records every context created and every
 * oscillator started (its wave type and starting frequency).
 */
export class FakeAudioContext {
  static created = 0;
  static started: { type: string; frequency: number }[] = [];

  state = 'running';
  currentTime = 0;
  destination = {};

  constructor() {
    FakeAudioContext.created += 1;
  }

  resume() {
    return Promise.resolve();
  }

  createGain() {
    return { gain: param(), connect: <T>(node: T) => node };
  }

  createOscillator() {
    const osc = {
      type: 'sine',
      frequency: param(),
      connect: <T>(node: T) => node,
      start: () =>
        FakeAudioContext.started.push({ type: osc.type, frequency: osc.frequency.value }),
      stop: () => {},
    };
    return osc;
  }
}

export function installFakeAudio() {
  FakeAudioContext.created = 0;
  FakeAudioContext.started = [];
  vi.stubGlobal('AudioContext', FakeAudioContext);
}

/** Starting frequencies of every tone played so far. */
export const playedFrequencies = () => FakeAudioContext.started.map((tone) => tone.frequency);
