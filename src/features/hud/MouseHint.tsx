import { Keyboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MOUSE_QUERY } from './mouseQuery';
import styles from './MouseHint.module.css';

export { MOUSE_QUERY };

const SHOW_FOR_MS = 6000;

/**
 * Computers ignore the mouse (see global.css), so a click would otherwise feel
 * broken. Instead it brings up the keyboard controls for a few seconds. Touch
 * screens never see this; they still tap.
 */
export function MouseHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const hide = () => setVisible(false);
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !window.matchMedia(MOUSE_QUERY).matches) return;
      setVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(hide, SHOW_FOR_MS);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', hide);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', hide);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div role="status" aria-label="Keyboard controls" className={styles.hint}>
      <Keyboard className={styles.icon} aria-hidden="true" />
      <span>
        This site is played with the keyboard: <kbd>↑</kbd>
        <kbd>↓</kbd>
        <kbd>←</kbd>
        <kbd>→</kbd> move · <kbd>Enter</kbd> select · <kbd>Esc</kbd> back · <kbd>Q</kbd>
        <kbd>E</kbd> tabs · <kbd>Tab</kbd> links
      </span>
    </div>
  );
}
