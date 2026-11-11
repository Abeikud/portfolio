import { useEffect } from 'react';
import { useScreenMemory } from '../../app/screenMemory';
import { resume } from '../../content/resume';
import { sections } from '../../content/sections';
import { SITE_NAME } from '../../hooks/useDocumentTitle';
import { TabBar } from '../hub/TabBar';
import { panelDomId, tabDomId } from '../hub/tabIds';
import { TileGrid } from '../hub/TileGrid';
import { ScreenLayout } from '../screens/ScreenLayout';
import { projectTabs, type ProjectTab } from './projectCategories';
import { ProjectTile } from './ProjectTile';
import styles from './ProjectsScreen.module.css';

const ID_PREFIX = 'projects';
const tabs = projectTabs(resume.projects);
const section = sections.find((s) => s.id === 'projects')!;

/** The Projects hub: category tabs over a grid of project tiles. */
export function ProjectsScreen() {
  const tiles = useScreenMemory('projects');
  const tabMemory = useScreenMemory('projects:tab');
  const tab = (tabMemory.selected ?? 'all') as ProjectTab;
  const visible = resume.projects.filter((p) => tab === 'all' || p.category === tab);
  const restoring = tiles.returnPending;

  // The grid has re-focused the remembered tile by now (child effects run first).
  const { clearReturn } = tiles;
  useEffect(() => {
    if (restoring) clearReturn();
  }, [restoring, clearReturn]);

  return (
    <ScreenLayout
      title={section.label}
      crumb={section.preview.kicker}
      documentTitle={`${section.preview.kicker} | ${SITE_NAME}`}
      sectionId="projects"
      focusTitle={!restoring}
    >
      <p className={styles.intro}>{section.preview.blurb}</p>
      <TabBar
        label="Filter projects"
        tabs={tabs}
        active={tab}
        onChange={tabMemory.select}
        idPrefix={ID_PREFIX}
      />
      <div role="tabpanel" id={panelDomId(ID_PREFIX)} aria-labelledby={tabDomId(ID_PREFIX, tab)}>
        <TileGrid
          label="Projects"
          items={visible.map((project) => ({
            key: project.slug,
            to: `/projects/${project.slug}`,
            label: project.name,
            children: <ProjectTile project={project} />,
          }))}
          selectedKey={tiles.selected}
          onSelect={tiles.select}
          focusOnMount={restoring}
          linkState={{ from: '/projects' }}
        />
      </div>
    </ScreenLayout>
  );
}
