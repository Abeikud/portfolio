import { ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useScreenMemory } from '../../app/screenMemory';
import { resume } from '../../content/resume';
import { SITE_NAME } from '../../hooks/useDocumentTitle';
import { NotFound } from '../screens/NotFound';
import { ScreenLayout } from '../screens/ScreenLayout';
import { categoryLabels } from './projectCategories';
import styles from './ProjectDetail.module.css';

/** /projects/:slug: the full write-up for one project. */
export function ProjectDetail() {
  const { slug } = useParams();
  const project = resume.projects.find((p) => p.slug === slug);
  const tiles = useScreenMemory('projects');
  const tabMemory = useScreenMemory('projects:tab');

  // Tell the hub which tile to restore (and make sure its tab shows it).
  const { select, markReturn } = tiles;
  const { selected: tab, select: selectTab } = tabMemory;
  useEffect(() => {
    if (!project) return;
    select(project.slug);
    markReturn();
    if (tab && tab !== 'all' && tab !== project.category) selectTab('all');
  }, [project, select, markReturn, tab, selectTab]);

  if (!project) return <NotFound />;

  return (
    <ScreenLayout
      title={project.name}
      crumb={project.name}
      trail={[{ label: 'Projects', to: '/projects' }]}
      documentTitle={`${project.name} | ${SITE_NAME}`}
      sectionId="projects"
      backTo="/projects"
    >
      <div className={styles.detail}>
        <div>
          <p className={styles.tagline}>
            <span className={styles.badge}>{categoryLabels[project.category]}</span>
            {project.tagline}
          </p>
          <ul className={styles.bullets}>
            {project.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>

        <aside className={styles.side}>
          <h2 className={styles.sideTitle}>Stack</h2>
          <ul aria-label="Tech stack" className={styles.chips}>
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>

          {project.links.length > 0 && (
            <>
              <h2 className={styles.sideTitle}>Links</h2>
              <ul className={styles.links}>
                {project.links.map((link) => (
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
    </ScreenLayout>
  );
}
