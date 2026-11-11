import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../test/renderWithRouter';
import { FakeAudioContext, installFakeAudio, playedFrequencies } from '../../test/fakeAudio';
import { CUES, cueLength, type Cue } from './cues';
import { playCue, resetSound, setSoundEnabled } from './uiSound';

const first = (cue: Cue) => CUES[cue][0]!.from;
const soundsOn = () => localStorage.setItem('dd:prefs', JSON.stringify({ sound: true }));

beforeEach(() => {
  resetSound();
  installFakeAudio();
});
afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});

describe('cues', () => {
  it('are short, quiet and pleasant', () => {
    for (const cue of Object.keys(CUES) as Cue[]) {
      expect(cueLength(cue), cue).toBeLessThanOrEqual(0.2);
      for (const tone of CUES[cue]) {
        expect(tone.gain, cue).toBeLessThanOrEqual(0.1);
        expect(tone.from, cue).toBeGreaterThanOrEqual(200);
        expect(tone.from, cue).toBeLessThanOrEqual(2000);
      }
    }
  });

  it('each sound different, so they can be told apart', () => {
    const starts = (Object.keys(CUES) as Cue[]).map(first);
    expect(new Set(starts).size).toBe(starts.length);
  });
});

describe('the sound engine', () => {
  it('stays completely silent, with no audio engine at all, while sounds are off', () => {
    playCue('move');
    expect(FakeAudioContext.created).toBe(0);
    expect(playedFrequencies()).toEqual([]);
  });

  it('plays a cue once switched on', () => {
    setSoundEnabled(true);
    playCue('open');
    expect(FakeAudioContext.created).toBe(1);
    expect(playedFrequencies()).toEqual(CUES.open.map((tone) => tone.from));
  });

  it('stays quiet while the tab is hidden', () => {
    setSoundEnabled(true);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    playCue('move');
    expect(playedFrequencies()).toEqual([]);
  });
});

describe('Menu sounds setting', () => {
  it('is off by default, toggles, and is remembered', async () => {
    const user = userEvent.setup();
    const firstVisit = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    const toggle = screen.getByRole('switch', { name: 'Menu sounds' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(playedFrequencies()).toContain(first('open')); // a confirmation blip
    expect(JSON.parse(localStorage.getItem('dd:prefs')!)).toMatchObject({ sound: true });

    firstVisit.unmount();
    renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('switch', { name: 'Menu sounds' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});

describe('cues while playing', () => {
  it('moving through the menu ticks, opening rises, going back falls', async () => {
    soundsOn();
    const user = userEvent.setup();
    renderApp('/');

    await user.keyboard('{ArrowDown}');
    expect(playedFrequencies()).toEqual([first('move')]);

    await user.keyboard('{Enter}');
    await waitFor(() => expect(playedFrequencies().at(-1)).toBe(CUES.open.at(-1)!.from));

    // Back pops history, which the router finishes asynchronously.
    await user.keyboard('{Escape}');
    await waitFor(() => expect(playedFrequencies().at(-1)).toBe(first('back')));
  });

  it('tiles tick and tabs click', async () => {
    soundsOn();
    const user = userEvent.setup();
    renderApp('/projects');
    await act(async () => {});
    const before = playedFrequencies().length;

    await user.keyboard('{ArrowRight}');
    expect(playedFrequencies().slice(before)).toEqual([first('move')]);

    await user.keyboard('e');
    expect(playedFrequencies().at(-1)).toBe(first('tab'));
  });

  it('nothing plays when sounds are off', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.keyboard('{ArrowDown}{Enter}{Escape}');
    expect(FakeAudioContext.created).toBe(0);
  });
});
