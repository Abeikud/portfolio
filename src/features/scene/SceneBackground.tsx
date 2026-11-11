import type { SectionId } from '../../content/types';

export interface SceneBackgroundProps {
  order: readonly SectionId[];
  activeId: SectionId;
}

// Stub: implemented in the green step of Phase 4.
export function SceneBackground(props: SceneBackgroundProps) {
  void props;
  return null;
}
