import { Trophy } from 'lucide-react';
import { acronym } from '../../content/format';
import { resume } from '../../content/resume';
import { ScreenLayout } from '../screens/ScreenLayout';
import { sectionScreenProps } from '../screens/sectionMeta';
import styles from './CertificationsScreen.module.css';

/** Certifications as a trophy cabinet. */
export function CertificationsScreen() {
  return (
    <ScreenLayout {...sectionScreenProps('certifications')}>
      <ul aria-label="Certifications" className={styles.cabinet}>
        {resume.certifications.map((cert) => (
          <li key={cert.id} className={styles.trophy}>
            <span className={styles.plinth} aria-hidden="true">
              <Trophy strokeWidth={1.4} />
              <span className={styles.issuerMark}>{acronym(cert.issuer)}</span>
            </span>
            <h2 className={styles.name}>{cert.name}</h2>
            <p className={styles.issuer}>{cert.issuer}</p>
          </li>
        ))}
      </ul>
    </ScreenLayout>
  );
}
