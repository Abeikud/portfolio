/**
 * The content contract for the whole site. Everything a screen renders comes
 * from data shaped like this, so the UI never hard-codes resume facts.
 */

export type SectionId =
  'about' | 'projects' | 'experience' | 'skills' | 'education' | 'certifications' | 'contact';

/** Copy shown in the preview panel while a menu item is selected. */
export interface SectionPreview {
  /** Small line above the headline, e.g. "Projects". */
  kicker: string;
  /** Big uppercase headline, e.g. "DIVE STRAIGHT INTO THE BUILD". */
  headline: string;
  blurb: string;
  /** Short items rendered joined with " · ". */
  highlights: string[];
  /** Pill button text, e.g. "Enter Projects". */
  ctaLabel: string;
}

/** One main-menu entry. Its `id` also keys the background scene. */
export interface Section {
  id: SectionId;
  label: string;
  route: `/${string}`;
  preview: SectionPreview;
}

/** Calendar month, 1–12. */
export interface YearMonth {
  year: number;
  month: number;
}

export interface DateRange {
  start: YearMonth;
  end: YearMonth | 'present';
}

export interface Role {
  /** URL-safe id used in /experience/:id. */
  id: string;
  title: string;
  /** Program or team inside the company, if any. */
  team?: string;
  company: string;
  dates: DateRange;
  stack: string[];
  bullets: string[];
}

export interface Link {
  label: string;
  href: string;
}

export type ProjectCategory = 'web' | 'macos';

export interface Project {
  /** URL-safe id used in /projects/:slug. */
  slug: string;
  name: string;
  tagline: string;
  category: ProjectCategory;
  stack: string[];
  bullets: string[];
  links: Link[];
}

export type SkillCategoryId = 'languages' | 'frameworks' | 'data-cloud' | 'tools';

export interface SkillCategory {
  id: SkillCategoryId;
  label: string;
  skills: string[];
}

export interface Education {
  school: string;
  degree: string;
  minor?: string;
  coursework: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
}

export interface Contact {
  email: string;
  linkedin: string;
  github: string;
  /** Path of a downloadable resume under public/, once one is provided. */
  resumePdf?: string;
}

export interface Profile {
  name: string;
  headline: string;
  location: string;
  bio: string[];
}

export interface Resume {
  profile: Profile;
  education: Education;
  experience: Role[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
  contact: Contact;
}
