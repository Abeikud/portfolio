import { usePlayer } from '../../app/playerContext';
import { sections } from '../../content/sections';
import { progressOf } from './progress';
import styles from './TopHud.module.css';

/** Top-right "XP bar": how many of the sections the visitor has explored. */
export function TopHud() {
  const { visited } = usePlayer();
  const { count, total } = progressOf(visited, sections.length);

  return (
    <div className={styles.hud}>
      <span className={styles.label} aria-hidden="true">
        EXPLORED {count}/{total}
      </span>
      <div
        role="progressbar"
        aria-label="Sections explored"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={count}
        aria-valuetext={`${count} of ${total} sections explored`}
        className={styles.bar}
      >
        <span className={styles.fill} style={{ width: `${(count / total) * 100}%` }} />
      </div>
    </div>
  );
}
