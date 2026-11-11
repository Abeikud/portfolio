import { GraduationCap } from 'lucide-react';
import { resume } from '../../content/resume';
import { ScreenLayout } from '../screens/ScreenLayout';
import { sectionScreenProps } from '../screens/sectionMeta';
import styles from './EducationScreen.module.css';

/** Education: the degree as a single "club card" with its coursework. */
export function EducationScreen() {
  const { school, degree, minor, coursework } = resume.education;

  return (
    <ScreenLayout {...sectionScreenProps('education')}>
      <article className={styles.card}>
        <GraduationCap className={styles.crest} aria-hidden="true" strokeWidth={1.5} />
        <div>
          <h2 className={styles.school}>{school}</h2>
          <p className={styles.degree}>{degree}</p>
          {minor && <p className={styles.minor}>Minor in {minor}</p>}

          <h3 className={styles.label}>Coursework</h3>
          <ul aria-label="Coursework" className={styles.courses}>
            {coursework.map((course) => (
              <li key={course}>{course}</li>
            ))}
          </ul>
        </div>
      </article>
    </ScreenLayout>
  );
}
