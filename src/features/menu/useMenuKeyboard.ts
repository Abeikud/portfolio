import type { MenuIntent } from './menuKeys';

export interface UseMenuKeyboardOptions {
  enabled?: boolean;
}

// Stub: implemented in the green step of Phase 2.
export function useMenuKeyboard(
  onIntent: (intent: MenuIntent) => void,
  options: UseMenuKeyboardOptions = {},
): void {
  void onIntent;
  void options;
}
