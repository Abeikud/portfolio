import { useState } from 'react';
import { scenes } from '../../content/scenes';
import type { SectionId } from '../../content/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { sceneImage } from './sceneImages';
import { scenesToWarm } from './scenesToWarm';
import styles from './SceneBackground.module.css';

export interface SceneBackgroundProps {
  order: readonly SectionId[];
  activeId: SectionId;
  /** Darker shade for content screens. */
  dim?: boolean;
}

/**
 * Full-bleed stadium photo behind the menu, crossfading per section. Only the
 * active scene and its neighbours are loaded; once loaded a scene stays put so
 * moving back is instant.
 */
export function SceneBackground({ order, activeId }: SceneBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const [warm, setWarm] = useState<ReadonlySet<SectionId>>(
    () => new Set(scenesToWarm(order, activeId)),
  );

  // Adjusting state during render (not in an effect) avoids a frame where the
  // newly active layer has no image yet.
  const needed = scenesToWarm(order, activeId);
  if (needed.some((id) => !warm.has(id))) {
    setWarm(new Set([...warm, ...needed]));
  }

  const credit = scenes[activeId];

  return (
    <div className={styles.root} data-drift={!reducedMotion}>
      {order.map((id) => {
        const isActive = id === activeId;
        const image = warm.has(id) ? sceneImage(id) : undefined;
        return (
          <div key={id} className={styles.layer} data-scene={id} data-active={isActive}>
            {image && (
              <img
                className={styles.photo}
                src={image.src}
                srcSet={image.srcSet}
                sizes="100vw"
                alt=""
                decoding="async"
                fetchPriority={isActive ? 'high' : 'low'}
                style={{ objectPosition: scenes[id].position }}
              />
            )}
          </div>
        );
      })}
      <div className={styles.shade} />
      {credit && (
        <p className={styles.credit}>
          Photo:{' '}
          <a href={credit.source} target="_blank" rel="noopener noreferrer">
            {credit.artist}
          </a>{' '}
          ·{' '}
          <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">
            {credit.license}
          </a>
        </p>
      )}
    </div>
  );
}
