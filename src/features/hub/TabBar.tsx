import { useEffect, useEffectEvent, useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { isTextEntry } from '../menu/menuKeys';
import { panelDomId, tabDomId } from './tabIds';
import styles from './TabBar.module.css';

export interface Tab {
  id: string;
  label: string;
}

export interface TabBarProps {
  label: string;
  tabs: readonly Tab[];
  active: string;
  onChange: (id: string) => void;
  /** Prefix for tab/panel DOM ids so a panel can reference the active tab. */
  idPrefix: string;
}

/**
 * Hub tabs with console-style shoulder buttons: Q / E cycle from anywhere,
 * ← / → work when a tab has focus (the standard ARIA tabs pattern).
 */
export function TabBar({ label, tabs, active, onChange, idPrefix }: TabBarProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === active),
  );

  const step = (delta: number) => {
    const next = tabs[(activeIndex + delta + tabs.length) % tabs.length];
    if (next && next.id !== active) onChange(next.id);
  };

  const handleShoulder = useEffectEvent((event: globalThis.KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    if (isTextEntry(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === 'q') step(-1);
    else if (key === 'e') step(1);
    else return;
    event.preventDefault();
  });

  useLayoutEffect(() => {
    const listener = (event: globalThis.KeyboardEvent) => handleShoulder(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  // When a tab has focus, keep focus on the active tab as it changes.
  useEffect(() => {
    const list = listRef.current;
    if (list?.contains(document.activeElement)) {
      list.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    }
  }, [active]);

  const handleKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, () => void> = {
      ArrowLeft: () => step(-1),
      ArrowRight: () => step(1),
      Home: () => tabs[0] && onChange(tabs[0].id),
      End: () => tabs.at(-1) && onChange(tabs.at(-1)!.id),
      // Down drops into the panel, onto its current (tabbable) item.
      ArrowDown: () =>
        document
          .getElementById(panelDomId(idPrefix))
          ?.querySelector<HTMLElement>('[tabindex="0"]')
          ?.focus(),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault(); // also tells the tile grid to leave this key alone
    move();
  };

  return (
    <div className={styles.bar}>
      <kbd className={styles.shoulder} aria-hidden="true">
        Q
      </kbd>
      <div ref={listRef} role="tablist" aria-label={label} className={styles.tabs}>
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabDomId(idPrefix, tab.id)}
              aria-selected={selected}
              aria-controls={panelDomId(idPrefix)}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => onChange(tab.id)}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <kbd className={styles.shoulder} aria-hidden="true">
        E
      </kbd>
    </div>
  );
}
