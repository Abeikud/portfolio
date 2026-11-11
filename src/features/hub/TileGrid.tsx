import type { ReactNode } from 'react';

export interface TileItem {
  key: string;
  /** Route the tile opens. */
  to: string;
  /** Accessible name (the visible title). */
  label: string;
  children: ReactNode;
}

export interface TileGridProps {
  label: string;
  items: readonly TileItem[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  focusOnMount?: boolean;
  /** Fixed column count (tests); otherwise measured from the layout. */
  columns?: number;
  /** Router state passed when a tile is opened. */
  linkState?: unknown;
}

// Stub: implemented in the green step of Phase 6.
export function TileGrid(props: TileGridProps) {
  void props;
  return null;
}
