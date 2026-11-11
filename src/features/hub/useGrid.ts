import { useEffect, useEffectEvent, useLayoutEffect, useRef, type RefObject } from 'react';
import { gridKeyToIntent } from './gridKeys';
import { moveInGrid } from './moveInGrid';
import { playCue } from '../sound/uiSound';

export interface UseGridOptions {
  /** The list whose links are the grid's items, in order. */
  listRef: RefObject<HTMLElement | null>;
  count: number;
  selected: number;
  onSelect: (index: number) => void;
  /** Enter / Space on the selection, from anywhere on the screen. */
  onActivate: (index: number) => void;
  /** Fixed column count (tests); otherwise measured from the layout. */
  columns?: number;
  /** Focus the selected item on mount (returning from a detail page). */
  focusOnMount?: boolean;
}

/** Columns in a CSS grid = items sharing the first item's row. */
function measureColumns(list: HTMLElement | null): number {
  const cells = list ? ([...list.children] as HTMLElement[]) : [];
  if (cells.length === 0) return 1;
  const top = cells[0]!.offsetTop;
  return Math.max(1, cells.filter((cell) => cell.offsetTop === top).length);
}

/**
 * Console-style keyboard control for a grid of links: arrows / WASD move the
 * selection in 2D from anywhere on the screen, Enter opens it, and focus
 * follows the selection. Shared by the hub tiles and the contact cards.
 */
export function useGrid({
  listRef,
  count,
  selected,
  onSelect,
  onActivate,
  columns,
  focusOnMount = false,
}: UseGridOptions): void {
  const itemAt = (index: number) =>
    listRef.current?.querySelectorAll<HTMLElement>('a')[index] ?? null;

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const intent = gridKeyToIntent(event);
    if (!intent || count === 0) return;
    event.preventDefault();

    if (intent === 'activate') {
      onActivate(selected);
      return;
    }
    const next = moveInGrid(selected, intent, count, columns ?? measureColumns(listRef.current));
    if (next === selected) return;
    playCue('move');
    onSelect(next);
  });

  useLayoutEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const restoreFocus = useEffectEvent(() => {
    if (focusOnMount) itemAt(selected)?.focus({ preventScroll: true });
  });
  useEffect(() => restoreFocus(), []);

  // Focus follows the selection unless the user is busy elsewhere (a tab, a
  // field). Arriving focus sits on the screen title (tabindex -1): fair game.
  const lastSelected = useRef(selected);
  const followFocus = useEffectEvent(() => {
    if (lastSelected.current === selected) return;
    lastSelected.current = selected;
    const active = document.activeElement;
    const free =
      !active ||
      active === document.body ||
      listRef.current?.contains(active) ||
      active.getAttribute('tabindex') === '-1';
    if (free) itemAt(selected)?.focus({ preventScroll: true });
  });
  useEffect(() => followFocus(), [selected]);
}
