import { CUES, type Cue } from './cues';

/**
 * The menu-sound engine. Off by default; while off nothing is created at all.
 * The AudioContext is made on the first cue after sounds are switched on,
 * which follows a key press or tap, as browsers require.
 */
let enabled = false;
let context: AudioContext | null = null;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

function audio(): AudioContext | null {
  if (context) return context;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  context = Ctor ? new Ctor() : null;
  return context;
}

export function playCue(cue: Cue): void {
  if (!enabled || document.hidden) return;
  const ctx = audio();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});

  const t0 = ctx.currentTime;
  for (const tone of CUES[cue]) {
    const start = t0 + tone.start;
    const end = start + tone.duration;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.from, start);
    if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, end);
    // Quick attack, smooth decay: no clicks at either end.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone.gain, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

/** Forgets the engine and switches sounds off (tests start from scratch). */
export function resetSound(): void {
  enabled = false;
  context = null;
}
