import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Link, useNavigate } from 'react-router';
import { gridKeyToIntent } from './gridKeys';
import { moveInGrid } from './moveInGrid';
import styles from './TileGrid.module.css';

export interface TileItem {
  key: string;
  /** Route the tile opens. */
  to: string;
  /** Accessible name (the visible title). */
  label: string;
  children: ReactNode;
}

export interface TileGridProps {
  label: string;
  items: readonly TileItem[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  focusOnMount?: boolean;
  /** Fixed column count (tests); otherwise measured from the layout. */
  columns?: number;
  /** Router state passed when a tile is opened. */
  linkState?: unknown;
}

/** Columns in a CSS grid = items sharing the first item's row. */
function measureColumns(list: HTMLElement | null): number {
  const cells = list ? ([...list.children] as HTMLElement[]) : [];
  if (cells.length === 0) return 1;
  const top = cells[0]!.offsetTop;
  return Math.max(1, cells.filter((cell) => cell.offsetTop === top).length);
}

/**
 * A console-style tile grid: arrows / WASD move a selection in 2D from
 * anywhere on the screen, Enter opens it, hover selects, focus follows.
 */
export function TileGrid({
  label,
  items,
  selectedKey,
  onSelect,
  focusOnMount = false,
  columns,
  linkState,
}: TileGridProps) {
  const navigate = useNavigate();
  const listRef = useRef<HTMLUListElement>(null);
  const selected = Math.max(
    0,
    items.findIndex((item) => item.key === selectedKey),
  );

  const linkAt = (index: number) =>
    listRef.current?.querySelectorAll<HTMLAnchorElement>('a')[index] ?? null;

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const intent = gridKeyToIntent(event);
    if (!intent || items.length === 0) return;
    event.preventDefault();

    if (intent === 'activate') {
      const item = items[selected]!;
      navigate(item.to, { state: linkState, viewTransition: true });
      return;
    }
    const next = moveInGrid(
      selected,
      intent,
      items.length,
      columns ?? measureColumns(listRef.current),
    );
    if (next !== selected) onSelect(items[next]!.key);
  });

  useLayoutEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const restoreFocus = useEffectEvent(() => {
    if (focusOnMount) linkAt(selected)?.focus({ preventScroll: true });
  });
  useEffect(() => restoreFocus(), []);

  // Focus follows the selection unless the user is busy elsewhere (a tab, a
  // field). Arriving focus sits on the screen title (tabindex -1): fair game.
  const lastSelected = useRef(selected);
  useEffect(() => {
    if (lastSelected.current === selected) return;
    lastSelected.current = selected;
    const active = document.activeElement;
    const free =
      !active ||
      active === document.body ||
      listRef.current?.contains(active) ||
      active.getAttribute('tabindex') === '-1';
    if (free) linkAt(selected)?.focus({ preventScroll: true });
  }, [selected]);

  const handlePointerEnter = (key: string) => (event: PointerEvent) => {
    if (event.pointerType !== 'touch') onSelect(key);
  };

  return (
    <ul ref={listRef} aria-label={label} className={styles.grid}>
      {items.map((item, index) => (
        <li key={item.key} className={styles.cell} data-selected={index === selected}>
          <Link
            to={item.to}
            state={linkState}
            viewTransition
            aria-label={item.label}
            tabIndex={index === selected ? 0 : -1}
            className={styles.tile}
            onPointerEnter={handlePointerEnter(item.key)}
          >
            {item.children}
          </Link>
        </li>
      ))}
    </ul>
  );
}
