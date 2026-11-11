import type { Project, ProjectCategory } from '../../content/types';

export const categoryLabels: Record<ProjectCategory, string> = {
  web: 'Web',
  macos: 'macOS',
};

export type ProjectTab = 'all' | ProjectCategory;

/** "All" plus each category that has projects, in first-appearance order. */
export function projectTabs(projects: readonly Project[]) {
  const categories = [...new Set(projects.map((p) => p.category))];
  return [
    { id: 'all' as ProjectTab, label: 'All' },
    ...categories.map((c) => ({ id: c as ProjectTab, label: categoryLabels[c] })),
  ];
}

/** "StartingFive" → "SF", "DIsland" → "DI", "Portfolio Website" → "PW". */
export const monogram = (name: string) =>
  (name.match(/[A-Z]/g) ?? [name[0] ?? '?']).slice(0, 2).join('');
