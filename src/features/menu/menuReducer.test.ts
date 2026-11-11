import { describe, expect, it } from 'vitest';
import { createMenuState, menuReducer, type MenuAction } from './menuReducer';

describe('createMenuState', () => {
  it.each([
    { count: 7, initial: undefined, selected: 0 },
    { count: 7, initial: 3, selected: 3 },
    { count: 7, initial: 99, selected: 6 },
    { count: 7, initial: -4, selected: 0 },
    { count: 0, initial: undefined, selected: -1 },
  ])('count=$count initial=$initial → selected $selected', ({ count, initial, selected }) => {
    expect(createMenuState(count, initial)).toEqual({ count, selected });
  });
});

describe('menuReducer', () => {
  const at = (selected: number) => ({ selected, count: 7 });

  it.each<[string, number, MenuAction, number]>([
    ['next moves down one', 0, { type: 'next' }, 1],
    ['prev moves up one', 3, { type: 'prev' }, 2],
    ['first jumps to the top', 5, { type: 'first' }, 0],
    ['last jumps to the bottom', 2, { type: 'last' }, 6],
    ['select picks an index', 0, { type: 'select', index: 4 }, 4],
  ])('%s', (_, from, action, to) => {
    expect(menuReducer(at(from), action)).toEqual(at(to));
  });

  // Returning the *same* object for no-ops lets React skip the re-render.
  it.each<[string, number, MenuAction]>([
    ['next clamps at the last item', 6, { type: 'next' }],
    ['prev clamps at the first item', 0, { type: 'prev' }],
    ['first when already first', 0, { type: 'first' }],
    ['last when already last', 6, { type: 'last' }],
    ['select the current item', 2, { type: 'select', index: 2 }],
    ['select below range', 2, { type: 'select', index: -1 }],
    ['select above range', 2, { type: 'select', index: 7 }],
    ['select a non-integer', 2, { type: 'select', index: 2.5 }],
  ])('no-op: %s returns the same state', (_, from, action) => {
    const state = at(from);
    expect(menuReducer(state, action)).toBe(state);
  });

  it.each<MenuAction>([
    { type: 'next' },
    { type: 'prev' },
    { type: 'first' },
    { type: 'last' },
    { type: 'select', index: 0 },
  ])('empty menu ignores $type', (action) => {
    const empty = createMenuState(0);
    expect(menuReducer(empty, action)).toBe(empty);
  });
});
