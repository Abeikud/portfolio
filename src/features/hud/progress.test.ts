import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJson, writeJson } from '../../lib/storage';
import { loadVisited, markVisited, progressOf, saveVisited } from './progress';

describe('markVisited', () => {
  it('adds a new section in visit order', () => {
    expect(markVisited(['about'], 'skills')).toEqual(['about', 'skills']);
  });

  it('is idempotent and returns the same array when nothing changes', () => {
    const visited = ['about', 'skills'] as const;
    expect(markVisited(visited, 'about')).toBe(visited);
  });
});

describe('progressOf', () => {
  it('counts towards the total and flags completion', () => {
    expect(progressOf(['about', 'skills'], 7)).toEqual({ count: 2, total: 7, complete: false });
    expect(
      progressOf(
        ['about', 'projects', 'experience', 'skills', 'education', 'certifications', 'contact'],
        7,
      ),
    ).toEqual({ count: 7, total: 7, complete: true });
  });
});

describe('persistence', () => {
  afterEach(() => vi.restoreAllMocks());

  it('round-trips visited sections through localStorage', () => {
    saveVisited(['contact', 'about']);
    expect(loadVisited()).toEqual(['contact', 'about']);
  });

  it('drops unknown ids and garbage', () => {
    localStorage.setItem('dd:visited', JSON.stringify(['about', 'hacked', 42, 'skills']));
    expect(loadVisited()).toEqual(['about', 'skills']);

    localStorage.setItem('dd:visited', '{not json');
    expect(loadVisited()).toEqual([]);
  });

  it('never throws when storage is unavailable (private mode, blocked cookies)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => saveVisited(['about'])).not.toThrow();
    expect(loadVisited()).toEqual([]);
    expect(readJson('anything', 'fallback')).toBe('fallback');
    expect(() => writeJson('anything', 1)).not.toThrow();
  });
});
