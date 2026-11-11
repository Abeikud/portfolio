/**
 * Console-style UI sounds, described as a few oscillator tones each and
 * synthesised in the browser (no audio files to download or license).
 */
export type Cue = 'move' | 'open' | 'back' | 'tab';

export interface Tone {
  type: OscillatorType;
  /** Starting pitch in Hz, optionally sliding to `to`. */
  from: number;
  to?: number;
  /** Seconds after the cue starts. */
  start: number;
  duration: number;
  /** Peak volume, 0–1. Kept low: these sit under everything else. */
  gain: number;
}

export const CUES: Readonly<Record<Cue, readonly Tone[]>> = {
  // A soft, high tick for each step through a list.
  move: [{ type: 'triangle', from: 1320, to: 1180, start: 0, duration: 0.035, gain: 0.05 }],
  // Two rising notes: "in".
  open: [
    { type: 'sine', from: 660, start: 0, duration: 0.07, gain: 0.07 },
    { type: 'sine', from: 990, start: 0.06, duration: 0.1, gain: 0.07 },
  ],
  // A falling slide: "out".
  back: [{ type: 'sine', from: 740, to: 440, start: 0, duration: 0.12, gain: 0.06 }],
  // A short click for a shoulder-button tab switch.
  tab: [{ type: 'square', from: 880, to: 820, start: 0, duration: 0.025, gain: 0.025 }],
};

/** How long a cue lasts, in seconds. */
export const cueLength = (cue: Cue): number =>
  Math.max(...CUES[cue].map((tone) => tone.start + tone.duration));
