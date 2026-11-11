import { useEffect, useState } from 'react';
import { setInputMode } from '../../app/inputMode';
import { NATIVE_ACTIVATION } from '../menu/menuKeys';
import { mergePads, padToKeys, readPad, startTracker, type GamepadLike } from './padKeys';

/** Key events this bridge dispatched, so they don't count as keyboard use. */
const padEvents = new WeakSet<Event>();

function connectedPads(): GamepadLike[] {
  if (typeof navigator.getGamepads !== 'function') return [];
  return Array.from(navigator.getGamepads()).filter(
    (pad): pad is Gamepad => pad !== null && pad.connected !== false,
  );
}

const readAll = () => mergePads(connectedPads().map(readPad));

export interface LinkOpeners {
  open: (url: string, target: string) => Window | null;
  assign: (url: string) => void;
}

const browserOpeners: LinkOpeners = {
  open: (url, target) => window.open(url, target),
  assign: (url) => window.location.assign(url),
};

/**
 * Follows a link from a controller press. Browsers don't count a controller
 * button as a click, so a new tab may be blocked: then open it in this tab.
 */
export function openLink(anchor: HTMLAnchorElement, { open, assign } = browserOpeners): void {
  if (anchor.target === '_blank' && anchor.href) {
    const tab = open(anchor.href, '_blank');
    if (tab) tab.opener = null;
    else assign(anchor.href);
    return;
  }
  anchor.click();
}

/** What a real Enter would do on a focused button or link. */
function activate(target: Element) {
  const control = target.closest<HTMLElement>(NATIVE_ACTIVATION);
  if (control instanceof HTMLAnchorElement) openLink(control);
  else control?.click();
}

/**
 * Sends a controller press to the page as the matching key, on the focused
 * element, so every existing keyboard handler works with a controller too.
 */
function firePress(key: string, repeat: boolean) {
  setInputMode('pad');
  const active = document.activeElement;
  const target = active instanceof HTMLElement ? active : document.body;
  const event = new KeyboardEvent('keydown', { key, repeat, bubbles: true, cancelable: true });
  padEvents.add(event);
  const unhandled = target.dispatchEvent(event);
  if (key === 'Enter' && unhandled) activate(target);
}

/**
 * Lets visitors play the site with a game controller (D-pad/stick, A, B,
 * LB/RB). Polls only while a controller is connected.
 */
export function useGamepadBridge(): { connected: boolean } {
  const [connected, setConnected] = useState(() => connectedPads().length > 0);

  useEffect(() => {
    const sync = () => setConnected(connectedPads().length > 0);
    // A real keypress switches the prompts back to keyboard keys.
    const onKey = (event: KeyboardEvent) => {
      if (!padEvents.has(event)) setInputMode('keys');
    };
    window.addEventListener('gamepadconnected', sync);
    window.addEventListener('gamepaddisconnected', sync);
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('gamepadconnected', sync);
      window.removeEventListener('gamepaddisconnected', sync);
      window.removeEventListener('keydown', onKey, true);
    };
  }, []);

  useEffect(() => {
    if (!connected) return;
    // Buttons already down when the pad connects (often the press that woke
    // it up) don't fire until they're pressed again.
    let tracker = padToKeys(startTracker(), readAll(), performance.now()).tracker;
    let frame = requestAnimationFrame(function poll() {
      const result = padToKeys(tracker, readAll(), performance.now());
      tracker = result.tracker;
      for (const press of result.presses) firePress(press.key, press.repeat);
      frame = requestAnimationFrame(poll);
    });
    return () => cancelAnimationFrame(frame);
  }, [connected]);

  return { connected };
}
