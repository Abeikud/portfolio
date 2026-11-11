import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useReturnToHub } from '../../app/hubMemory';
import { useScreenMemory } from '../../app/screenMemory';
import { resume } from '../../content/resume';
import { SITE_NAME } from '../../hooks/useDocumentTitle';
import { DetailBody } from '../screens/DetailBody';
import detailStyles from '../screens/DetailBody.module.css';
import { NotFound } from '../screens/NotFound';
import { ScreenLayout } from '../screens/ScreenLayout';
import { categoryLabels } from './projectCategories';

/** /projects/:slug: the full write-up for one project. */
export function ProjectDetail() {
  const { slug } = useParams();
  const project = resume.projects.find((p) => p.slug === slug);
  useReturnToHub('projects', project?.slug);

  // Make sure the hub's remembered tab still shows this project.
  const { selected: tab, select: selectTab } = useScreenMemory('projects:tab');
  useEffect(() => {
    if (project && tab && tab !== 'all' && tab !== project.category) selectTab('all');
  }, [project, tab, selectTab]);

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
      <DetailBody
        lead={
          <>
            <span className={detailStyles.badge}>{categoryLabels[project.category]}</span>
            <span>{project.tagline}</span>
          </>
        }
        bullets={project.bullets}
        stack={project.stack}
        links={project.links}
      />
    </ScreenLayout>
  );
}
