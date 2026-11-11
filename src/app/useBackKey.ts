import { useEffectEvent, useLayoutEffect } from 'react';
import { isBackKey } from './screenKeys';

/** Calls `onBack` when Escape/Backspace is pressed anywhere on the page. */
export function useBackKey(onBack: () => void): void {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!isBackKey(event)) return;
    event.preventDefault();
    onBack();
  });

  // Layout effect for the same reason as useMenuKeyboard: no gap between the
  // screen appearing and the key working.
  useLayoutEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
}
