import { useScreenMemory } from '../../app/screenMemory';
import { resume } from '../../content/resume';
import type { SkillCategoryId } from '../../content/types';
import { TabBar } from '../hub/TabBar';
import { panelDomId, tabDomId } from '../hub/tabIds';
import { ScreenLayout } from '../screens/ScreenLayout';
import { sectionScreenProps } from '../screens/sectionMeta';
import { skillMark } from './skillMark';
import styles from './SkillsScreen.module.css';

const ID_PREFIX = 'skills';

/** Short tab labels; the panel shows the category's full name. */
const tabLabels: Record<SkillCategoryId, string> = {
  languages: 'Languages',
  frameworks: 'Frameworks',
  'data-cloud': 'Data & Cloud',
  tools: 'Tools',
};

/** Position-style code on each card, like a squad sheet. */
const positions: Record<SkillCategoryId, string> = {
  languages: 'LNG',
  frameworks: 'FWK',
  'data-cloud': 'DAT',
  tools: 'TLS',
};

const tabs = resume.skills.map((c) => ({ id: c.id, label: tabLabels[c.id] }));

/** Skills: one tab per category, each skill an "element" card. */
export function SkillsScreen() {
  const tabMemory = useScreenMemory('skills:tab');
  const category = resume.skills.find((c) => c.id === tabMemory.selected) ?? resume.skills[0]!;

  return (
    <ScreenLayout {...sectionScreenProps('skills')}>
      <TabBar
        label="Skill categories"
        tabs={tabs}
        active={category.id}
        onChange={tabMemory.select}
        idPrefix={ID_PREFIX}
      />
      <div
        role="tabpanel"
        id={panelDomId(ID_PREFIX)}
        aria-labelledby={tabDomId(ID_PREFIX, category.id)}
      >
        <h2 className={styles.category}>{category.label}</h2>
        <ul aria-label="Skills" className={styles.cards} data-category={category.id}>
          {category.skills.map((skill) => (
            <li key={skill} aria-label={skill} className={styles.card}>
              <span className={styles.position} aria-hidden="true">
                {positions[category.id]}
              </span>
              <span className={styles.mark} aria-hidden="true">
                {skillMark(skill)}
              </span>
              <span className={styles.name} aria-hidden="true">
                {skill}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ScreenLayout>
  );
}
