export type MenuIntent = 'next' | 'prev' | 'first' | 'last' | 'activate';

export type MenuKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'altKey' | 'ctrlKey' | 'metaKey' | 'repeat' | 'isComposing' | 'target'
>;

const KEY_INTENTS: Record<string, MenuIntent> = {
  ArrowDown: 'next',
  s: 'next',
  S: 'next',
  ArrowUp: 'prev',
  w: 'prev',
  W: 'prev',
  Home: 'first',
  End: 'last',
  Enter: 'activate',
  ' ': 'activate',
};

/** Fields where keys are text input, not navigation. */
const TEXT_ENTRY = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
/** Elements that already turn Enter/Space into a click on their own. */
const NATIVE_ACTIVATION = 'button, a[href], summary, [role="button"], [role="link"]';

const matches = (target: EventTarget | null, selector: string) =>
  target instanceof Element && target.closest(selector) !== null;

/** True when keys pressed on `target` are text input rather than navigation. */
export const isTextEntry = (target: EventTarget | null) => matches(target, TEXT_ENTRY);

/**
 * Translates a keydown into a menu intent, or null when the menu should leave
 * the key alone (OS/browser shortcuts, typing, or a focused control that will
 * handle Enter/Space itself and would otherwise activate twice).
 */
export function keyToIntent(event: MenuKeyEvent): MenuIntent | null {
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return null;
  if (isTextEntry(event.target)) return null;

  const intent = KEY_INTENTS[event.key] ?? null;
  if (intent === 'activate' && (event.repeat || matches(event.target, NATIVE_ACTIVATION))) {
    return null;
  }
  return intent;
}
