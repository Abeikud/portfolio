import type { SectionId } from './types';

/** Attribution for a menu scene's background photo (all from Wikimedia Commons). */
export interface SceneCredit {
  id: SectionId;
  title: string;
  artist: string;
  license: string;
  licenseUrl: string;
  source: string;
  /** CSS object-position keeping the photo's subject in frame. */
  position: string;
}

// Stub: wired to scenes.json in the green step of Phase 4.
export const scenes = {} as Record<SectionId, SceneCredit>;
