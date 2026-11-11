import type { ReactElement } from 'react';
import type { RouteObject } from 'react-router';
import { sections } from '../content/sections';
import type { SectionId } from '../content/types';
import { ProjectDetail } from '../features/projects/ProjectDetail';
import { ProjectsScreen } from '../features/projects/ProjectsScreen';
import { NotFound } from '../features/screens/NotFound';
import { SectionScreen } from '../features/screens/SectionScreen';
import { MenuScreen } from './MenuScreen';
import { RootLayout } from './RootLayout';

/** Sections with a dedicated hub; the rest use the generic SectionScreen. */
const hubs: Partial<Record<SectionId, ReactElement>> = {
  projects: <ProjectsScreen />,
};

/** The route table, shared by the browser router and the in-memory test router. */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <MenuScreen /> },
      ...sections.map((section) => ({
        path: section.route.slice(1),
        element: hubs[section.id] ?? <SectionScreen id={section.id} />,
      })),
      { path: 'projects/:slug', element: <ProjectDetail /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
