import {
  BriefcaseBusiness,
  FolderGit2,
  GraduationCap,
  Layers,
  Send,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { SectionId } from '../../content/types';

/** One emblem per section for the preview panel. Typed so none can be missed. */
export const sectionIcons: Record<SectionId, LucideIcon> = {
  about: UserRound,
  projects: FolderGit2,
  experience: BriefcaseBusiness,
  skills: Layers,
  education: GraduationCap,
  certifications: Trophy,
  contact: Send,
};
