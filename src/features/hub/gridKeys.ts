import { isNativeActivation, isTextEntry, type MenuKeyEvent } from '../menu/menuKeys';
import type { GridMove } from './moveInGrid';

export type GridIntent = GridMove | 'activate';

const KEY_INTENTS: Record<string, GridIntent> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  Enter: 'activate',
  ' ': 'activate',
};

/** Translates a keydown into a tile-grid intent, with the same guards as the menu. */
export function gridKeyToIntent(
  event: MenuKeyEvent & { defaultPrevented?: boolean },
): GridIntent | null {
  if (event.defaultPrevented) return null;
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return null;
  if (isTextEntry(event.target)) return null;

  const intent = KEY_INTENTS[event.key] ?? null;
  if (intent === 'activate' && (event.repeat || isNativeActivation(event.target))) return null;
  return intent;
}
