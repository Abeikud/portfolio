import type { ReactElement } from 'react';
import type { RouteObject } from 'react-router';
import { sections } from '../content/sections';
import type { SectionId } from '../content/types';
import { AboutScreen } from '../features/about/AboutScreen';
import { CertificationsScreen } from '../features/certifications/CertificationsScreen';
import { ContactScreen } from '../features/contact/ContactScreen';
import { EducationScreen } from '../features/education/EducationScreen';
import { ExperienceScreen } from '../features/experience/ExperienceScreen';
import { RoleDetail } from '../features/experience/RoleDetail';
import { ProjectDetail } from '../features/projects/ProjectDetail';
import { ProjectsScreen } from '../features/projects/ProjectsScreen';
import { NotFound } from '../features/screens/NotFound';
import { SkillsScreen } from '../features/skills/SkillsScreen';
import { MenuScreen } from './MenuScreen';
import { RootLayout } from './RootLayout';

/** Every menu section's screen. Typed as a full Record so none can be missed. */
const screens: Record<SectionId, ReactElement> = {
  about: <AboutScreen />,
  projects: <ProjectsScreen />,
  experience: <ExperienceScreen />,
  skills: <SkillsScreen />,
  education: <EducationScreen />,
  certifications: <CertificationsScreen />,
  contact: <ContactScreen />,
};

/** The route table, shared by the browser router and the in-memory test router. */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <MenuScreen /> },
      ...sections.map((section) => ({
        path: section.route.slice(1),
        element: screens[section.id],
      })),
      { path: 'projects/:slug', element: <ProjectDetail /> },
      { path: 'experience/:id', element: <RoleDetail /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
