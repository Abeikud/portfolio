import { resume } from './resume';
import type { Section } from './types';

/**
 * Main-menu entries, in display order. Preview copy is what the panel beside
 * the menu shows while an entry is selected. Where highlights mirror resume
 * data they're derived from it, so the two can't drift apart.
 */
export const sections: Section[] = [
  {
    id: 'about',
    label: 'ABOUT',
    route: '/about',
    preview: {
      kicker: 'About',
      headline: 'MEET THE PLAYER',
      blurb:
        'CS student at UPEI who builds things end to end, from real-time multiplayer games to native macOS apps.',
      highlights: ['UPEI Computer Science', 'Minor in Mathematics', resume.profile.location],
      ctaLabel: 'Enter About',
    },
  },
  {
    id: 'projects',
    label: 'PROJECTS',
    route: '/projects',
    preview: {
      kicker: 'Projects',
      headline: 'DIVE STRAIGHT INTO THE BUILD',
      blurb:
        'Real-time multiplayer on the web, native apps on macOS. See what I’ve built and how it works under the hood.',
      highlights: resume.projects.map((p) => p.name),
      ctaLabel: 'Enter Projects',
    },
  },
  {
    id: 'experience',
    label: 'EXPERIENCE',
    route: '/experience',
    preview: {
      kicker: 'Experience',
      headline: 'MY CAREER SO FAR',
      blurb:
        'A full-stack engineering internship, data and routing work for the Government of PEI, technical support at Buchanan Technologies, and two terms as a teaching assistant.',
      highlights: ['Government of PEI', 'Buchanan Technologies', 'Amobys', 'UPEI'],
      ctaLabel: 'Enter Experience',
    },
  },
  {
    id: 'skills',
    label: 'SKILLS',
    route: '/skills',
    preview: {
      kicker: 'Skills',
      headline: 'THE FULL SQUAD',
      blurb:
        'The languages, frameworks, data stores and tools I reach for, from TypeScript and React to Spring Boot and BigQuery.',
      highlights: resume.skills.map((c) => c.label),
      ctaLabel: 'Enter Skills',
    },
  },
  {
    id: 'education',
    label: 'EDUCATION',
    route: '/education',
    preview: {
      kicker: 'Education',
      headline: 'THE TRAINING GROUND',
      blurb: `${resume.education.degree} at the ${resume.education.school}, with a Minor in ${resume.education.minor}.`,
      highlights: ['Data Structures & Algorithms', 'System Design', 'Machine Learning'],
      ctaLabel: 'Enter Education',
    },
  },
  {
    id: 'certifications',
    label: 'CERTIFICATIONS',
    route: '/certifications',
    preview: {
      kicker: 'Certifications',
      headline: 'SILVERWARE',
      blurb: 'Certifications earned alongside the degree.',
      highlights: resume.certifications.map((c) => c.name),
      ctaLabel: 'Enter Certifications',
    },
  },
  {
    id: 'contact',
    label: 'CONTACT',
    route: '/contact',
    preview: {
      kicker: 'Contact',
      headline: 'OPEN TO OFFERS',
      blurb: 'Looking for software engineering roles. Get in touch, or grab a copy of my resume.',
      highlights: ['Email', 'LinkedIn', 'GitHub', 'Resume'],
      ctaLabel: 'Enter Contact',
    },
  },
];
