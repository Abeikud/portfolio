import { useHubMemory } from '../../app/hubMemory';
import { useScreenMemory } from '../../app/screenMemory';
import { resume } from '../../content/resume';
import { TabBar } from '../hub/TabBar';
import { panelDomId, tabDomId } from '../hub/tabIds';
import { PROMPTS } from '../hud/prompts';
import { TileGrid } from '../hub/TileGrid';
import { ScreenLayout } from '../screens/ScreenLayout';
import { sectionScreenProps } from '../screens/sectionMeta';
import { projectTabs, type ProjectTab } from './projectCategories';
import { ProjectTile } from './ProjectTile';

const ID_PREFIX = 'projects';
const tabs = projectTabs(resume.projects);

/** The Projects hub: category tabs over a grid of project tiles. */
export function ProjectsScreen() {
  const tiles = useHubMemory('projects');
  const tabMemory = useScreenMemory('projects:tab');
  const tab = (tabMemory.selected ?? 'all') as ProjectTab;
  const visible = resume.projects.filter((p) => tab === 'all' || p.category === tab);

  return (
    <ScreenLayout
      prompts={[PROMPTS.tabs, PROMPTS.move, PROMPTS.open]}
      {...sectionScreenProps('projects')}
      focusTitle={!tiles.restoring}
    >
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
          focusOnMount={tiles.restoring}
          linkState={{ from: '/projects' }}
        />
      </div>
    </ScreenLayout>
  );
}
