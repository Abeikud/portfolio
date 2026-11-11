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

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export function createMenuState(count: number, initial = 0): MenuState {
  return { count, selected: count === 0 ? -1 : clamp(initial, 0, count - 1) };
}

/**
 * Console-style menu selection: moves clamp at the ends rather than wrapping.
 * No-op actions return the same state object so React can skip re-rendering.
 */
export function menuReducer(state: MenuState, action: MenuAction): MenuState {
  if (state.count === 0) return state;

  const last = state.count - 1;
  let target: number;
  switch (action.type) {
    case 'next':
      target = Math.min(state.selected + 1, last);
      break;
    case 'prev':
      target = Math.max(state.selected - 1, 0);
      break;
    case 'first':
      target = 0;
      break;
    case 'last':
      target = last;
      break;
    case 'select':
      if (!Number.isInteger(action.index) || action.index < 0 || action.index > last) {
        return state;
      }
      target = action.index;
      break;
  }

  return target === state.selected ? state : { ...state, selected: target };
}
