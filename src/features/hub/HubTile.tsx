import type { ReactNode } from 'react';
import styles from './HubTile.module.css';

export type TileVariant = 'teal' | 'violet' | 'blue' | 'amber';

export interface HubTileProps {
  /** Big italic letters on the card art. */
  mono: string;
  /** Small pill on the card art. */
  badge: string;
  variant: TileVariant;
  /** The tile's title: TileGrid's link. */
  title: ReactNode;
  subtitle: string;
  meta: ReactNode;
  /** Id for the subtitle + meta, which describe the link. */
  descriptionId?: string;
}

/** Card art + summary for a TileGrid cell. */
export function HubTile({
  mono,
  badge,
  variant,
  title,
  subtitle,
  meta,
  descriptionId,
}: HubTileProps) {
  return (
    <>
      <span className={styles.art} data-variant={variant} aria-hidden="true">
        <span className={styles.mono}>{mono}</span>
        <span className={styles.badge}>{badge}</span>
      </span>
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        <span id={descriptionId} className={styles.description}>
          <span className={styles.subtitle}>{subtitle}</span>
          <span className={styles.meta}>{meta}</span>
        </span>
      </span>
    </>
  );
}
