import { describe, expect, it } from 'vitest';
import { skillMark } from './skillMark';

describe('skillMark', () => {
  it.each([
    ['C++', 'C++'],
    ['SQL', 'SQL'],
    ['TypeScript', 'TS'],
    ['PostgreSQL', 'PS'],
    ['Spring Boot', 'SB'],
    ['Microsoft Entra ID', 'ME'],
    ['Python', 'Py'],
    ['Node.js', 'No'],
  ])('%s → %s', (name, mark) => {
    expect(skillMark(name)).toBe(mark);
  });
});
