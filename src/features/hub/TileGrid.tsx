import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Link, useNavigate } from 'react-router';
import { gridKeyToIntent } from './gridKeys';
import { moveInGrid } from './moveInGrid';
import styles from './TileGrid.module.css';

/** What a tile's renderer gets: the title link, and an id for its description. */
export interface TileSlot {
  /** The tile's only link, showing `label`; its click area covers the card. */
  link: ReactElement;
  /** Put this id on the element whose text describes the tile. */
  descriptionId: string;
}

export interface TileItem {
  key: string;
  /** Route the tile opens. */
  to: string;
  /** Visible title, which is also the link's accessible name. */
  label: string;
  /** Renders the card around the title link (stretched-link card pattern). */
  children: (slot: TileSlot) => ReactNode;
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
 * anywhere on the screen, Enter opens it, and focus follows. Mouse movement is
 * ignored (computers are played with the keyboard; touch still taps).
 *
 * Each card has exactly one link, its title, whose click area stretches over
 * the whole card; the rest of the card describes it (aria-describedby). That
 * keeps link names short and equal to their visible text (WCAG 2.5.3).
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
  const idBase = useId();
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

  return (
    <ul ref={listRef} aria-label={label} className={styles.grid}>
      {items.map((item, index) => {
        const descriptionId = `${idBase}-${item.key}-desc`;
        const link = (
          <Link
            to={item.to}
            state={linkState}
            viewTransition
            tabIndex={index === selected ? 0 : -1}
            aria-describedby={descriptionId}
            className={styles.link}
          >
            {item.label}
          </Link>
        );
        return (
          <li key={item.key} className={styles.cell} data-selected={index === selected}>
            {item.children({ link, descriptionId })}
          </li>
        );
      })}
    </ul>
  );
}
