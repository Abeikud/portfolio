import { Settings } from 'lucide-react';
import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { usePlayer } from '../../app/playerContext';
import { RAIL_ITEM } from './railItem';
import styles from './SettingsMenu.module.css';

/** The gear at the top of the icon rail, with a small settings panel. */
export function SettingsMenu() {
  const { reduceMotion, setReduceMotion } = usePlayer();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  const close = useEffectEvent((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) gearRef.current?.focus();
  });

  // While open: Escape closes (focus back to the gear); a click outside closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close(true);
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) close(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <button
        ref={gearRef}
        type="button"
        className={styles.gear}
        aria-label="Settings"
        title="Settings"
        aria-expanded={open}
        aria-controls={panelId}
        {...{ [RAIL_ITEM]: '' }}
        onClick={() => setOpen((o) => !o)}
      >
        <Settings aria-hidden="true" strokeWidth={2.25} />
      </button>

      {open && (
        <div id={panelId} role="group" aria-labelledby={titleId} className={styles.panel}>
          <h2 id={titleId} className={styles.title}>
            Settings
          </h2>
          <button
            type="button"
            role="switch"
            aria-checked={reduceMotion}
            className={styles.switch}
            onClick={() => setReduceMotion(!reduceMotion)}
          >
            <span>Reduce motion</span>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.thumb} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
