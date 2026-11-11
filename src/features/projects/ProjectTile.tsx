import type { Project } from '../../content/types';
import { HubTile } from '../hub/HubTile';
import { categoryLabels, monogram } from './projectCategories';

const VISIBLE_STACK = 3;

/** A project's card in the Projects hub. */
export function ProjectTile({ project }: { project: Project }) {
  const extra = project.stack.length - VISIBLE_STACK;
  return (
    <HubTile
      mono={monogram(project.name)}
      badge={categoryLabels[project.category]}
      variant={project.category === 'macos' ? 'violet' : 'teal'}
      title={project.name}
      subtitle={project.tagline}
      meta={`${project.stack.slice(0, VISIBLE_STACK).join(' · ')}${extra > 0 ? ` · +${extra}` : ''}`}
    />
  );
}
