import { describe, expect, it } from 'vitest';
import { resume } from './resume';
import { scenes } from './scenes';
import { sections } from './sections';
import type { YearMonth } from './types';

const URL_SAFE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// 10+ digits with optional separators, e.g. "+1 555-010-0199" or "(555) 010 0199".
const PHONE = /\+?\(?\d(?:[\s().-]*\d){9,}/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toMonths = ({ year, month }: YearMonth) => year * 12 + (month - 1);
const unique = <T>(xs: T[]) => new Set(xs).size === xs.length;

describe('sections', () => {
  it('lists the 7 menu sections in order', () => {
    expect(sections.map((s) => s.label)).toEqual([
      'ABOUT',
      'PROJECTS',
      'EXPERIENCE',
      'SKILLS',
      'EDUCATION',
      'CERTIFICATIONS',
      'CONTACT',
    ]);
  });

  it('has unique ids and routes, with each route derived from its id', () => {
    expect(unique(sections.map((s) => s.id))).toBe(true);
    expect(unique(sections.map((s) => s.route))).toBe(true);
    for (const s of sections) expect(s.route).toBe(`/${s.id}`);
  });

  it.each(sections.map((s) => [s.label, s] as const))('%s has complete preview copy', (_, s) => {
    const { kicker, headline, blurb, highlights, ctaLabel } = s.preview;
    expect(kicker.trim()).not.toBe('');
    expect(headline.trim()).not.toBe('');
    expect(headline).toBe(headline.toUpperCase());
    expect(blurb.trim()).not.toBe('');
    expect(highlights.length).toBeGreaterThan(0);
    for (const h of highlights) expect(h.trim()).not.toBe('');
    expect(ctaLabel).toMatch(/^Enter \S/);
  });

  it('keeps preview highlights in sync with the resume data', () => {
    const byId = Object.fromEntries(sections.map((s) => [s.id, s.preview.highlights]));
    expect(byId.projects).toEqual(resume.projects.map((p) => p.name));
    expect(byId.skills).toEqual(resume.skills.map((c) => c.label));
    expect(byId.certifications).toEqual(resume.certifications.map((c) => c.name));
  });
});

describe('experience', () => {
  it('has at least one role', () => {
    expect(resume.experience.length).toBeGreaterThan(0);
  });

  it('is sorted newest first by start date', () => {
    const starts = resume.experience.map((r) => toMonths(r.dates.start));
    expect(starts).toEqual([...starts].sort((a, b) => b - a));
  });

  it('has unique, URL-safe role ids', () => {
    const ids = resume.experience.map((r) => r.id);
    expect(unique(ids)).toBe(true);
    for (const id of ids) expect(id).toMatch(URL_SAFE);
  });

  it.each(resume.experience.map((r) => [`${r.title} @ ${r.company}`, r] as const))(
    '%s is complete',
    (_, role) => {
      expect(role.title.trim()).not.toBe('');
      expect(role.company.trim()).not.toBe('');
      expect(role.bullets.length).toBeGreaterThan(0);
      expect(role.stack.length).toBeGreaterThan(0);

      const { start, end } = role.dates;
      expect(start.month).toBeGreaterThanOrEqual(1);
      expect(start.month).toBeLessThanOrEqual(12);
      if (end !== 'present') {
        expect(end.month).toBeGreaterThanOrEqual(1);
        expect(end.month).toBeLessThanOrEqual(12);
        expect(toMonths(end)).toBeGreaterThanOrEqual(toMonths(start));
      }
    },
  );
});

describe('projects', () => {
  it('has at least one project', () => {
    expect(resume.projects.length).toBeGreaterThan(0);
  });

  it('has unique, URL-safe slugs', () => {
    const slugs = resume.projects.map((p) => p.slug);
    expect(unique(slugs)).toBe(true);
    for (const slug of slugs) expect(slug).toMatch(URL_SAFE);
  });

  it.each(resume.projects.map((p) => [p.name, p] as const))('%s is complete', (_, project) => {
    expect(project.tagline.trim()).not.toBe('');
    expect(project.stack.length).toBeGreaterThan(0);
    expect(project.bullets.length).toBeGreaterThanOrEqual(2);
    for (const link of project.links) expect(link.href).toMatch(/^https:\/\//);
  });
});

describe('skills', () => {
  it('has the 4 categories, each non-empty', () => {
    expect(resume.skills.map((c) => c.id)).toEqual([
      'languages',
      'frameworks',
      'data-cloud',
      'tools',
    ]);
    for (const c of resume.skills) expect(c.skills.length).toBeGreaterThan(0);
  });

  it('never lists the same skill twice, across all categories', () => {
    const all = resume.skills.flatMap((c) => c.skills.map((s) => s.toLowerCase()));
    expect(unique(all)).toBe(true);
  });
});

describe('education and certifications', () => {
  it('has a school, degree and coursework', () => {
    expect(resume.education.school.trim()).not.toBe('');
    expect(resume.education.degree.trim()).not.toBe('');
    expect(resume.education.coursework.length).toBeGreaterThan(0);
  });

  it('has certifications with unique, URL-safe ids', () => {
    const ids = resume.certifications.map((c) => c.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(unique(ids)).toBe(true);
    for (const id of ids) expect(id).toMatch(URL_SAFE);
  });
});

describe('contact and privacy', () => {
  it('has a valid email and https LinkedIn/GitHub profile links', () => {
    expect(resume.contact.email).toMatch(EMAIL);
    expect(resume.contact.linkedin).toMatch(/^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/);
    expect(resume.contact.github).toMatch(/^https:\/\/github\.com\/[\w-]+\/?$/);
  });

  it('the phone pattern catches common formats (guards the guard)', () => {
    for (const fake of ['+1 555-010-0199', '(555) 010 0199', '555.010.0199', '5550100199']) {
      expect(fake).toMatch(PHONE);
    }
    expect('22,104 player-seasons from 1974').not.toMatch(PHONE);
  });

  it('never publishes a phone number anywhere in the content', () => {
    expect(JSON.stringify({ resume, sections })).not.toMatch(PHONE);
  });
});

describe('scene photo credits', () => {
  it.each(sections.map((s) => s.id))('%s has a credited, freely licensed photo', (id) => {
    const scene = scenes[id];

    expect(scene).toBeDefined();
    expect(scene.id).toBe(id);
    expect(scene.artist.trim()).not.toBe('');
    expect(scene.license).toMatch(/^(CC0|CC BY 4\.0|CC BY-SA 4\.0)$/);
    expect(scene.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\//);
    expect(scene.source).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    expect(scene.position).toMatch(/^\d{1,3}% \d{1,3}%$/);
  });
});

describe('launch readiness', () => {
  it('has no placeholder copy left anywhere in the content', () => {
    const everything = JSON.stringify({ resume, sections, scenes });
    expect(everything).not.toMatch(/\b(TODO|TBD|FIXME|lorem ipsum|placeholder)\b/i);
  });
});
