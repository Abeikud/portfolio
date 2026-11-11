import data from './scenes.json';
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
  /** Extra blur applied by scripts/fetch-scenes.mjs for very busy photos. */
  soften?: number;
}

/**
 * Scene credits keyed by section. scenes.json is shared with the image script;
 * content.test.ts checks every section has a valid entry.
 */
export const scenes = Object.fromEntries(
  (data as SceneCredit[]).map((scene) => [scene.id, scene]),
) as Record<SectionId, SceneCredit>;
