export interface MenuState {
  /** Index of the selected item, or -1 when the menu is empty. */
  selected: number;
  count: number;
}

export type MenuAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'first' }
  | { type: 'last' }
  | { type: 'select'; index: number };

// Stub: implemented in the green step of Phase 2.
export function createMenuState(count: number, initial = 0): MenuState {
  void initial;
  return { selected: 0, count };
}

// Stub: implemented in the green step of Phase 2.
export function menuReducer(state: MenuState, action: MenuAction): MenuState {
  void action;
  return state;
}
