import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';
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
}

/**
 * The big vertical menu. Selection is visual (size + brightness, fading with
 * distance) and mirrored by aria-current and a roving tabindex.
 */
export function MenuList({ items, selected, onSelect, onActivate, describedBy }: MenuListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const lastSelected = useRef(selected);

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

  // Only a real hover selects. Touch fires pointer-over right before the click,
  // which would turn the first tap into an activation.
  const handlePointerEnter = (index: number) => (event: PointerEvent) => {
    if (event.pointerType !== 'touch') onSelect(index);
  };

  // Clicking the selected item enters it. A click on another item selects it
  // first (touch), unless it came from a keyboard or assistive tech (detail 0).
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
                onPointerEnter={handlePointerEnter(index)}
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
