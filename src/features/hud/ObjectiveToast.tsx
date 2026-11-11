import { ArrowRight, Target, Trophy, X } from 'lucide-react';
import { Link } from 'react-router';
import { usePlayer } from '../../app/playerContext';
import { sections } from '../../content/sections';
import { progressOf } from './progress';
import styles from './ObjectiveToast.module.css';

/** Bottom-right toast with the "season objective": explore every section. */
export function ObjectiveToast() {
  const { visited, isDismissed, dismiss } = usePlayer();
  const { total, complete } = progressOf(visited, sections.length);
  const id = complete ? 'objective-complete' : 'objective-intro';
  if (isDismissed(id)) return null;

  return (
    <div role="status" className={styles.toast} data-complete={complete}>
      {complete ? (
        <>
          <Trophy className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>
            <strong>Objective complete.</strong> You’ve seen every section.
          </span>
          <Link to="/contact" state={{ from: '/' }} viewTransition className={styles.cta}>
            Let’s talk
            <ArrowRight aria-hidden="true" />
          </Link>
        </>
      ) : (
        <>
          <Target className={styles.icon} aria-hidden="true" />
          <span className={styles.text}>
            <strong>Season objective:</strong> explore all {total} sections
          </span>
        </>
      )}
      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss"
        onClick={() => dismiss(id)}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
