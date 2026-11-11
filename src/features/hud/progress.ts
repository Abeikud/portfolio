import type { SectionId } from '../../content/types';

export interface Progress {
  count: number;
  total: number;
  complete: boolean;
}

// Stub: implemented in the green step of Phase 9.
export function markVisited(visited: readonly SectionId[], id: SectionId): readonly SectionId[] {
  void id;
  return visited;
}

// Stub: implemented in the green step of Phase 9.
export function progressOf(visited: readonly SectionId[], total: number): Progress {
  void visited;
  return { count: 0, total, complete: false };
}

// Stub: implemented in the green step of Phase 9.
export function loadVisited(): SectionId[] {
  return [];
}

// Stub: implemented in the green step of Phase 9.
export function saveVisited(visited: readonly SectionId[]): void {
  void visited;
}
