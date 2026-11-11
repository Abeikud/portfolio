import { useEffectEvent, useLayoutEffect } from 'react';
import { keyToIntent, type MenuIntent } from './menuKeys';

export interface UseMenuKeyboardOptions {
  enabled?: boolean;
}

/**
 * Listens for menu keys anywhere on the page (like a console menu, focus
 * doesn't need to be on the list) and reports them as intents.
 */
export function useMenuKeyboard(
  onIntent: (intent: MenuIntent) => void,
  { enabled = true }: UseMenuKeyboardOptions = {},
): void {
  // Effect events always see the latest onIntent without re-subscribing.
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const intent = keyToIntent(event);
    if (!intent) return;
    event.preventDefault();
    onIntent(intent);
  });

  // Layout effect: the listener is attached in the same commit that puts the
  // menu on screen, so a visible menu always responds to keys (no race).
  useLayoutEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}
