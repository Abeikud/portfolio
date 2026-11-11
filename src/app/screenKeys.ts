import { isTextEntry, type MenuKeyEvent } from '../features/menu/menuKeys';

/**
 * Escape or Backspace means "back" on a content screen, like B / Circle on a
 * controller, unless the user is typing, holding a shortcut or auto-repeating.
 */
export function isBackKey(event: MenuKeyEvent): boolean {
  if (event.key !== 'Escape' && event.key !== 'Backspace') return false;
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  if (event.isComposing || event.repeat) return false;
  return !isTextEntry(event.target);
}
