import { Mesh, Points } from 'three';
import { describe, expect, it } from 'vitest';
import { BALL_RADIUS, PITCH, ballTargetFor, buildStadiumScene, dustField } from './stadium';
import {
  ALLOW_SOFTWARE_KEY,
  MIN_WIDTH,
  contextOptions,
  isSoftwareRenderer,
  shouldRender3D,
  type RenderConditions,
} from './shouldRender3D';

describe('shouldRender3D', () => {
  const ok: RenderConditions = {
    webgl: true,
    reducedMotion: false,
    enabled: true,
    saveData: false,
    wide: true,
  };

  it('renders on a capable, wide screen with motion and the setting on', () => {
    expect(shouldRender3D(ok)).toBe(true);
    expect(MIN_WIDTH).toBe(768);
  });

  it.each([
    ['no WebGL', { webgl: false }],
    ['reduced motion', { reducedMotion: true }],
    ['the 3D effects setting off', { enabled: false }],
    ['the browser asking to save data', { saveData: true }],
    ['a phone-sized screen', { wide: false }],
  ] as const)('stays off with %s', (_, patch) => {
    expect(shouldRender3D({ ...ok, ...patch })).toBe(false);
  });
});

describe('software rendering', () => {
  it('recognises WebGL drawn on the CPU instead of a GPU', () => {
    for (const name of [
      'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)',
      'llvmpipe (LLVM 15.0.7, 256 bits)',
      'Microsoft Basic Render Driver',
    ])
      expect(isSoftwareRenderer(name), name).toBe(true);
    for (const name of [
      'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
      'NVIDIA GeForce RTX 3060/PCIe/SSE2',
      'Adreno (TM) 740',
    ])
      expect(isSoftwareRenderer(name), name).toBe(false);
  });

  it('asks the browser to refuse slow WebGL, unless tests opt in', () => {
    expect(contextOptions()).toEqual({ failIfMajorPerformanceCaveat: true });
    localStorage.setItem(ALLOW_SOFTWARE_KEY, '1');
    expect(contextOptions()).toEqual({ failIfMajorPerformanceCaveat: false });
    localStorage.removeItem(ALLOW_SOFTWARE_KEY);
  });
});

describe('ballTargetFor', () => {
  it('gives every section its own spot on the pitch', () => {
    const spots = Array.from({ length: 7 }, (_, i) => ballTargetFor(i, 7));
    expect(new Set(spots.map((s) => `${s.x},${s.z}`)).size).toBe(7);
    for (const { x, z } of spots) {
      expect(x).toBeGreaterThanOrEqual(PITCH.minX);
      expect(x).toBeLessThanOrEqual(PITCH.maxX);
      expect(z).toBeGreaterThanOrEqual(PITCH.minZ);
      expect(z).toBeLessThanOrEqual(PITCH.maxZ);
    }
  });

  it('is deterministic and clamps out-of-range input', () => {
    expect(ballTargetFor(3, 7)).toEqual(ballTargetFor(3, 7));
    expect(ballTargetFor(99, 7)).toEqual(ballTargetFor(6, 7));
    expect(ballTargetFor(-1, 7)).toEqual(ballTargetFor(0, 7));
    expect(ballTargetFor(0, 1)).toEqual(ballTargetFor(0, 1));
  });
});

describe('dustField', () => {
  it('places the requested number of motes inside the floodlight volume', () => {
    const { positions, seeds } = dustField(300, 7);
    expect(positions).toHaveLength(900);
    expect(seeds).toHaveLength(300);
    for (let i = 0; i < positions.length; i += 3) {
      expect(Math.abs(positions[i]!)).toBeLessThanOrEqual(7);
      expect(positions[i + 1]!).toBeGreaterThanOrEqual(0);
      expect(positions[i + 1]!).toBeLessThanOrEqual(5);
      expect(positions[i + 2]!).toBeLessThanOrEqual(1);
    }
  });

  it('is seeded: the same seed always gives the same field', () => {
    expect(dustField(50, 1).positions).toEqual(dustField(50, 1).positions);
    expect(dustField(50, 1).positions).not.toEqual(dustField(50, 2).positions);
  });
});

describe('buildStadiumScene', () => {
  it('has a football resting on the pitch and a cloud of floodlight dust', () => {
    const { scene, ball, dust } = buildStadiumScene({ dustCount: 400 });

    expect(ball).toBeInstanceOf(Mesh);
    expect(scene.getObjectByName('ball')).toBe(ball);
    expect(ball.position.y).toBeCloseTo(BALL_RADIUS);

    expect(dust).toBeInstanceOf(Points);
    expect(scene.getObjectByName('dust')).toBe(dust);
    expect(dust.geometry.getAttribute('position').count).toBe(400);
  });

  it('paints the ball with white panels and dark patches (no logos, no textures)', () => {
    const { ball } = buildStadiumScene({ dustCount: 10 });
    const colors = ball.geometry.getAttribute('color');
    const shades = new Set<string>();
    for (let i = 0; i < colors.count; i++) shades.add(colors.getX(i) > 0.5 ? 'white' : 'dark');
    expect(shades).toEqual(new Set(['white', 'dark']));
  });

  it('starts the ball at the first section and can dispose everything', () => {
    const built = buildStadiumScene({ dustCount: 10 });
    const start = ballTargetFor(0, 7);
    built.placeBall(start);
    expect(built.ball.position.x).toBeCloseTo(start.x);
    expect(built.ball.position.z).toBeCloseTo(start.z);
    expect(() => built.dispose()).not.toThrow();
  });
});
