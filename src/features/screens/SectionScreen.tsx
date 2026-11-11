import { ScreenLayout } from './ScreenLayout';
import { sectionById, sectionScreenProps } from './sectionMeta';
import type { SectionId } from '../../content/types';
import styles from './SectionScreen.module.css';

/** Placeholder screen for sections whose hub hasn't been built yet (Phase 8). */
export function SectionScreen({ id }: { id: SectionId }) {
  return (
    <ScreenLayout {...sectionScreenProps(id)}>
      <p className={styles.meta}>{sectionById(id).preview.highlights.join(' · ')}</p>
    </ScreenLayout>
  );
}
