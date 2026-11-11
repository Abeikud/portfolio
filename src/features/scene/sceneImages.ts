import type { SectionId } from '../../content/types';

export interface SceneImage {
  src: string;
  srcSet: string;
}

// Stub: implemented in the green step of Phase 4.
export function sceneImage(id: SectionId): SceneImage | undefined {
  void id;
  return undefined;
}
