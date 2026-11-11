import { describe, expect, it } from 'vitest';
import { sections } from '../../content/sections';
import { sceneImage } from './sceneImages';
import { scenesToWarm } from './scenesToWarm';

describe('sceneImage', () => {
  it.each(sections.map((s) => s.id))('%s has 768/1280/1920 WebP renditions', (id) => {
    const image = sceneImage(id);

    expect(image).toBeDefined();
    expect(image!.srcSet.split(', ').map((entry) => entry.split(' ')[1])).toEqual([
      '768w',
      '1280w',
      '1920w',
    ]);
    expect(image!.srcSet).not.toMatch(/undefined/);
    expect(image!.src).toMatch(/1280\.webp/);
  });
});

describe('scenesToWarm', () => {
  const order = ['a', 'b', 'c', 'd'] as const;

  it.each([
    ['a', ['a', 'b']],
    ['c', ['b', 'c', 'd']],
    ['d', ['c', 'd']],
  ] as const)('around %s → %j', (active, expected) => {
    expect(scenesToWarm(order, active)).toEqual(expected);
  });

  it('returns nothing for an unknown id', () => {
    expect(scenesToWarm<string>(order, 'z')).toEqual([]);
  });
});
