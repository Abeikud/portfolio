import { resume } from '../../content/resume';
import styles from './BrandMark.module.css';

/** Top-left logo: a slanted "DD" monogram with the full name beside it. */
export function BrandMark() {
  return (
    <h1 className={styles.brand}>
      <span className={styles.mark} aria-hidden="true">
        DD
      </span>
      <span className={styles.name}>{resume.profile.name}</span>
    </h1>
  );
}
