import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { scenes } from '../../content/scenes';
import { sections } from '../../content/sections';
import { setMediaQuery } from '../../test/matchMedia';
import { REDUCED_MOTION_QUERY } from '../../hooks/useReducedMotion';
import { SceneBackground } from './SceneBackground';

const order = sections.map((s) => s.id);
const layers = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('[data-scene]')];
const withImage = (root: HTMLElement) =>
  layers(root)
    .filter((layer) => layer.querySelector('img'))
    .map((layer) => layer.dataset.scene);

describe('SceneBackground', () => {
  it('stacks one layer per section, with only the active one shown', () => {
    const { container } = render(<SceneBackground order={order} activeId="skills" />);

    expect(layers(container).map((l) => l.dataset.scene)).toEqual(order);
    expect(
      layers(container)
        .filter((l) => l.dataset.active === 'true')
        .map((l) => l.dataset.scene),
    ).toEqual(['skills']);
  });

  it('uses decorative images only (empty alt)', () => {
    const { container } = render(<SceneBackground order={order} activeId="about" />);
    const images = [...container.querySelectorAll('img')];

    expect(images.length).toBeGreaterThan(0);
    for (const img of images) expect(img).toHaveAttribute('alt', '');
  });

  it('loads only the active scene and its neighbours up front', () => {
    const { container } = render(<SceneBackground order={order} activeId="about" />);
    expect(withImage(container)).toEqual(['about', 'projects']);
  });

  it('keeps loaded scenes and warms new neighbours as the selection moves', () => {
    const { container, rerender } = render(<SceneBackground order={order} activeId="about" />);

    rerender(<SceneBackground order={order} activeId="skills" />);

    expect(withImage(container)).toEqual([
      'about',
      'projects',
      'experience',
      'skills',
      'education',
    ]);
  });

  it('drifts slowly (Ken Burns) only when reduced motion is off', () => {
    const { container, unmount } = render(<SceneBackground order={order} activeId="about" />);
    expect(container.querySelector('[data-drift]')).toHaveAttribute('data-drift', 'true');
    unmount();

    setMediaQuery(REDUCED_MOTION_QUERY, true);
    const reduced = render(<SceneBackground order={order} activeId="about" />);
    expect(reduced.container.querySelector('[data-drift]')).toHaveAttribute('data-drift', 'false');
  });

  it('credits the active photo with links to the source and the licence', () => {
    render(<SceneBackground order={order} activeId="skills" />);
    const credit = screen.getByText(/Photo:/).closest('p')!;

    expect(within(credit).getByRole('link', { name: scenes.skills.artist })).toHaveAttribute(
      'href',
      scenes.skills.source,
    );
    expect(within(credit).getByRole('link', { name: scenes.skills.license })).toHaveAttribute(
      'href',
      scenes.skills.licenseUrl,
    );
  });
});
