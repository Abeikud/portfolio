import { Link } from 'react-router';
import { SITE_NAME } from '../../hooks/useDocumentTitle';
import { ScreenLayout } from './ScreenLayout';
import styles from './SectionScreen.module.css';

export function NotFound() {
  return (
    <ScreenLayout
      title="PAGE NOT FOUND"
      crumb="Not found"
      documentTitle={`Not found | ${SITE_NAME}`}
      scene="education"
    >
      <p className={styles.lead}>
        Looks like that one was offside. The page you’re after doesn’t exist.
      </p>
      <p className={styles.meta}>
        <Link to="/" viewTransition>
          Back to main menu
        </Link>
      </p>
    </ScreenLayout>
  );
}
