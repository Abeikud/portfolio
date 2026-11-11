import { sections } from '../../content/sections';
import type { Section, SectionId } from '../../content/types';
import { SITE_NAME } from '../../hooks/useDocumentTitle';

export const sectionById = (id: SectionId): Section => sections.find((s) => s.id === id)!;

/** The ScreenLayout props every section's main screen shares. */
export function sectionScreenProps(id: SectionId) {
  const { label, preview } = sectionById(id);
  return {
    title: label,
    crumb: preview.kicker,
    documentTitle: `${preview.kicker} | ${SITE_NAME}`,
    sectionId: id,
    intro: preview.blurb,
  };
}
