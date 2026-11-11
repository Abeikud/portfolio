import type { MenuKeyEvent } from '../menu/menuKeys';
import type { GridMove } from './moveInGrid';

export type GridIntent = GridMove | 'activate';

// Stub: implemented in the green step of Phase 6.
export function gridKeyToIntent(
  event: MenuKeyEvent & { defaultPrevented?: boolean },
): GridIntent | null {
  void event;
  return null;
}
