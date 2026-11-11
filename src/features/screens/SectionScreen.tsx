import { sections } from '../../content/sections';
import type { SectionId } from '../../content/types';
import { SITE_NAME } from '../../hooks/useDocumentTitle';
import { ScreenLayout } from './ScreenLayout';
import styles from './SectionScreen.module.css';

/**
 * A section's screen. For now it shows the section's intro; Phases 6–8 give
 * each section its own hub.
 */
export function SectionScreen({ id }: { id: SectionId }) {
  const section = sections.find((s) => s.id === id)!;
  const { kicker, blurb, highlights } = section.preview;

  return (
    <ScreenLayout
      title={section.label}
      crumb={kicker}
      documentTitle={`${kicker} | ${SITE_NAME}`}
      sectionId={id}
    >
      <p className={styles.lead}>{blurb}</p>
      <p className={styles.meta}>{highlights.join(' · ')}</p>
    </ScreenLayout>
  );
}
