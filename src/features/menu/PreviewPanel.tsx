import { CornerDownLeft } from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router';
import { useInputMode } from '../../app/inputMode';
import type { Section } from '../../content/types';
import { sectionIcons } from './sectionIcons';
import styles from './PreviewPanel.module.css';

export interface PreviewPanelProps {
  section: Section;
  /** Lets the menu point aria-describedby at the blurb. */
  blurbId?: string;
}

/** The panel beside the menu that sells the selected section. */
export function PreviewPanel({ section, blurbId }: PreviewPanelProps) {
  const headingId = useId();
  const { kicker, headline, blurb, highlights, ctaLabel } = section.preview;
  const Icon = sectionIcons[section.id];
  const pad = useInputMode() === 'pad';

  return (
    // Keyed by section so the entrance animation replays on every change.
    <section key={section.id} className={styles.panel} aria-labelledby={headingId}>
      <Icon className={styles.emblem} aria-hidden="true" strokeWidth={1.6} />
      <p className={styles.kicker}>{kicker}</p>
      <h2 id={headingId} className={styles.headline}>
        {headline}
      </h2>
      <p id={blurbId} className={styles.blurb}>
        {blurb}
      </p>
      <p className={styles.highlights}>{highlights.join(' · ')}</p>
      <Link className={styles.cta} to={section.route} state={{ from: '/' }} viewTransition>
        <span className={styles.key} aria-hidden="true">
          {pad ? 'A' : <CornerDownLeft strokeWidth={2.5} />}
        </span>
        {ctaLabel}
      </Link>
    </section>
  );
}
