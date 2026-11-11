import { describe, expect, it } from 'vitest';
import type { MenuKeyEvent } from '../menu/menuKeys';
import { gridKeyToIntent, type GridIntent } from './gridKeys';
import { moveInGrid, type GridMove } from './moveInGrid';

describe('moveInGrid', () => {
  // 7 tiles in 3 columns:
  //   0 1 2
  //   3 4 5
  //   6
  it.each<[number, GridMove, number]>([
    [0, 'right', 1],
    [1, 'left', 0],
    [2, 'right', 2], // end of row: stay
    [3, 'left', 3], // start of row: stay
    [6, 'right', 6], // last tile: stay
    [1, 'down', 4],
    [4, 'up', 1],
    [0, 'up', 0], // top row: stay
    [4, 'down', 6], // nothing directly below: drop to the last tile
    [6, 'down', 6], // bottom row: stay
  ])('from %i, %s → %i', (from, move, to) => {
    expect(moveInGrid(from, move, 7, 3)).toBe(to);
  });

  it('treats a single row as a horizontal strip', () => {
    expect(moveInGrid(0, 'right', 3, 3)).toBe(1);
    expect(moveInGrid(1, 'down', 3, 3)).toBe(1);
  });

  it('copes with an empty grid', () => {
    expect(moveInGrid(0, 'right', 0, 3)).toBe(0);
  });
});

const press = (
  key: string,
  overrides: Partial<MenuKeyEvent & { defaultPrevented: boolean }> = {},
) => ({
  key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  repeat: false,
  isComposing: false,
  defaultPrevented: false,
  target: document.body as EventTarget,
  ...overrides,
});

describe('gridKeyToIntent', () => {
  it.each<[string, GridIntent]>([
    ['ArrowUp', 'up'],
    ['w', 'up'],
    ['ArrowDown', 'down'],
    ['s', 'down'],
    ['ArrowLeft', 'left'],
    ['a', 'left'],
    ['ArrowRight', 'right'],
    ['d', 'right'],
    ['Enter', 'activate'],
    [' ', 'activate'],
  ])('maps %j to %s', (key, intent) => {
    expect(gridKeyToIntent(press(key))).toBe(intent);
  });

  it('ignores keys something else already handled (e.g. the tab bar)', () => {
    expect(gridKeyToIntent(press('ArrowRight', { defaultPrevented: true }))).toBeNull();
  });

  it('ignores modifiers, typing, and Enter on links (they open themselves)', () => {
    expect(gridKeyToIntent(press('ArrowRight', { metaKey: true }))).toBeNull();
    expect(gridKeyToIntent(press('d', { target: document.createElement('input') }))).toBeNull();
    const link = document.createElement('a');
    link.href = '/x';
    expect(gridKeyToIntent(press('Enter', { target: link }))).toBeNull();
    expect(gridKeyToIntent(press('ArrowDown', { target: link }))).toBe('down');
  });
});
