import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Link } from '../../content/types';
import styles from './DetailBody.module.css';

export interface DetailBodyProps {
  /** One line above the bullets: badges, tagline, company… */
  lead: ReactNode;
  bullets: readonly string[];
  stack: readonly string[];
  links?: readonly Link[];
}

/** Shared body for project and role pages: bullets plus a stack/links panel. */
export function DetailBody({ lead, bullets, stack, links = [] }: DetailBodyProps) {
  return (
    <div className={styles.detail}>
      <div>
        <div className={styles.lead}>{lead}</div>
        <ul className={styles.bullets}>
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>

      <aside className={styles.side}>
        <h2 className={styles.sideTitle}>Stack</h2>
        <ul aria-label="Tech stack" className={styles.chips}>
          {stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        {links.length > 0 && (
          <>
            <h2 className={styles.sideTitle}>Links</h2>
            <ul className={styles.links}>
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                    <ExternalLink aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
