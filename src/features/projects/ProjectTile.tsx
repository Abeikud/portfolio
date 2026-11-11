import type { Project } from '../../content/types';
import { HubTile } from '../hub/HubTile';
import type { TileSlot } from '../hub/TileGrid';
import { categoryLabels, monogram } from './projectCategories';

const VISIBLE_STACK = 3;

/** A project's card in the Projects hub. */
export function ProjectTile({ project, link, descriptionId }: { project: Project } & TileSlot) {
  const extra = project.stack.length - VISIBLE_STACK;
  return (
    <HubTile
      mono={monogram(project.name)}
      badge={categoryLabels[project.category]}
      variant={project.category === 'macos' ? 'violet' : 'teal'}
      title={link}
      descriptionId={descriptionId}
      subtitle={project.tagline}
      meta={`${project.stack.slice(0, VISIBLE_STACK).join(' · ')}${extra > 0 ? ` · +${extra}` : ''}`}
    />
  );
}
