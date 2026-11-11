import type { RouteObject } from 'react-router';
import { sections } from '../content/sections';
import { NotFound } from '../features/screens/NotFound';
import { SectionScreen } from '../features/screens/SectionScreen';
import { MenuScreen } from './MenuScreen';
import { RootLayout } from './RootLayout';

/** The route table, shared by the browser router and the in-memory test router. */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <MenuScreen /> },
      ...sections.map((section) => ({
        path: section.route.slice(1),
        element: <SectionScreen id={section.id} />,
      })),
      { path: '*', element: <NotFound /> },
    ],
  },
];
