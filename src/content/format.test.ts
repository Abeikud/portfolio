import { describe, expect, it } from 'vitest';
import { acronym, formatRange } from './format';

describe('formatRange', () => {
  it('formats a closed range as "Mon YYYY – Mon YYYY"', () => {
    expect(formatRange({ start: { year: 2026, month: 6 }, end: { year: 2026, month: 9 } })).toBe(
      'Jun 2026 – Sep 2026',
    );
  });

  it('spans years', () => {
    expect(formatRange({ start: { year: 2025, month: 9 }, end: { year: 2026, month: 4 } })).toBe(
      'Sep 2025 – Apr 2026',
    );
  });

  it('says Present for an ongoing role', () => {
    expect(formatRange({ start: { year: 2026, month: 1 }, end: 'present' })).toBe(
      'Jan 2026 – Present',
    );
  });
});

describe('acronym', () => {
  it.each([
    ['Government of Prince Edward Island', 'GPEI'],
    ['University of Prince Edward Island', 'UPEI'],
    ['Amobys', 'AM'],
    ['Google Cloud', 'GC'],
    ['Coursera', 'CO'],
  ])('%s → %s', (name, expected) => {
    expect(acronym(name)).toBe(expected);
  });
});
