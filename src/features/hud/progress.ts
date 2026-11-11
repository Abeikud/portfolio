import { sections } from '../../content/sections';
import type { SectionId } from '../../content/types';
import { readJson, writeJson } from '../../lib/storage';

export interface Progress {
  count: number;
  total: number;
  complete: boolean;
}

const KEY = 'dd:visited';
const known = new Set<string>(sections.map((s) => s.id));

/** Adds `id` (once). Returns the same array when it was already there. */
export function markVisited(visited: readonly SectionId[], id: SectionId): readonly SectionId[] {
  return visited.includes(id) ? visited : [...visited, id];
}

export function progressOf(visited: readonly SectionId[], total: number): Progress {
  const count = Math.min(visited.length, total);
  return { count, total, complete: count >= total };
}

/** Visited sections from storage, ignoring anything that isn't a known id. */
export function loadVisited(): SectionId[] {
  const raw = readJson<unknown>(KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is SectionId => typeof id === 'string' && known.has(id));
}

export function saveVisited(visited: readonly SectionId[]): void {
  writeJson(KEY, visited);
}
