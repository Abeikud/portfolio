import type { RefObject } from 'react';

export interface UseGridOptions {
  listRef: RefObject<HTMLElement | null>;
  count: number;
  selected: number;
  onSelect: (index: number) => void;
  onActivate: (index: number) => void;
  columns?: number;
  focusOnMount?: boolean;
}

// Stub: implemented in the green step.
export function useGrid(options: UseGridOptions): void {
  void options;
}
