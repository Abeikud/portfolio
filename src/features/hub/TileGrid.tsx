import { useId, useRef, type ReactElement, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useGrid } from './useGrid';
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

  useGrid({
    listRef,
    count: items.length,
    selected,
    onSelect: (index) => onSelect(items[index]!.key),
    onActivate: (index) => navigate(items[index]!.to, { state: linkState, viewTransition: true }),
    columns,
    focusOnMount,
  });

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
