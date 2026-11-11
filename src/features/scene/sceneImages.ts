import type { SectionId } from '../../content/types';

export interface SceneImage {
  src: string;
  srcSet: string;
}

const WIDTHS = [768, 1280, 1920] as const;

// Vite fingerprints each rendition and gives us its final URL.
const urls = import.meta.glob<string>('../../assets/scenes/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const urlFor = (id: SectionId, width: number) => urls[`../../assets/scenes/${id}-${width}.webp`];

/** Responsive sources for a scene, or undefined if any rendition is missing. */
export function sceneImage(id: SectionId): SceneImage | undefined {
  const sized = WIDTHS.map((w) => [w, urlFor(id, w)] as const);
  if (sized.some(([, url]) => !url)) return undefined;
  return {
    src: urlFor(id, 1280)!,
    srcSet: sized.map(([w, url]) => `${url} ${w}w`).join(', '),
  };
}
