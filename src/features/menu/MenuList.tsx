import { useEffect, useEffectEvent, useRef, type MouseEvent } from 'react';
import styles from './MenuList.module.css';

export interface MenuListItem {
  id: string;
  label: string;
}

export interface MenuListProps {
  items: MenuListItem[];
  selected: number;
  onSelect: (index: number) => void;
  onActivate: (index: number) => void;
  /** Id of an element describing the selected item (the preview blurb). */
  describedBy?: string;
  /** Focus the selected item on mount (e.g. when returning from a screen). */
  focusOnMount?: boolean;
}

/**
 * The big vertical menu. Selection is visual (size + brightness, fading with
 * distance) and mirrored by aria-current and a roving tabindex.
 */
export function MenuList({
  items,
  selected,
  onSelect,
  onActivate,
  describedBy,
  focusOnMount = false,
}: MenuListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const lastSelected = useRef(selected);

  const focusSelectedOnMount = useEffectEvent(() => {
    if (focusOnMount)
      listRef.current?.querySelectorAll('button')[selected]?.focus({ preventScroll: true });
  });
  useEffect(() => focusSelectedOnMount(), []);

  // Focus follows the selection, but never steals focus from elsewhere on the
  // page (e.g. an icon-rail link) and never on first render.
  useEffect(() => {
    if (lastSelected.current === selected) return;
    lastSelected.current = selected;

    const list = listRef.current;
    const active = document.activeElement;
    if (!list || (active && active !== document.body && !list.contains(active))) return;
    list.querySelectorAll('button')[selected]?.focus({ preventScroll: true });
  }, [selected]);

  // The mouse is ignored on computers (see global.css), so clicks here are taps:
  // the first selects, a second on the selected item enters. Clicks from a
  // keyboard or assistive tech (detail 0) enter straight away.
  const handleClick = (index: number) => (event: MouseEvent) => {
    if (index === selected || event.detail === 0) onActivate(index);
    else onSelect(index);
  };

  return (
    <nav aria-label="Main menu">
      <ul ref={listRef} className={styles.list}>
        {items.map((item, index) => {
          const isSelected = index === selected;
          return (
            <li key={item.id} className={styles.item} data-distance={Math.abs(index - selected)}>
              <button
                type="button"
                className={styles.button}
                aria-current={isSelected ? 'true' : undefined}
                aria-describedby={isSelected ? describedBy : undefined}
                tabIndex={isSelected ? 0 : -1}
                onClick={handleClick(index)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
