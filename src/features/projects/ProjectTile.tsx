import type { Project } from '../../content/types';
import { categoryLabels, monogram } from './projectCategories';
import styles from './ProjectTile.module.css';

const VISIBLE_STACK = 3;

/** Card art + summary for a project tile. */
export function ProjectTile({ project }: { project: Project }) {
  const extra = project.stack.length - VISIBLE_STACK;
  return (
    <>
      <span className={styles.art} data-category={project.category} aria-hidden="true">
        <span className={styles.mono}>{monogram(project.name)}</span>
        <span className={styles.badge}>{categoryLabels[project.category]}</span>
      </span>
      <span className={styles.body}>
        <span className={styles.name}>{project.name}</span>
        <span className={styles.tagline}>{project.tagline}</span>
        <span className={styles.stack}>
          {project.stack.slice(0, VISIBLE_STACK).join(' · ')}
          {extra > 0 && ` · +${extra}`}
        </span>
      </span>
    </>
  );
}
