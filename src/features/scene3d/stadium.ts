import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
} from 'three';

/**
 * The 3D layer's scene: a football resting on the pitch and floodlight dust,
 * drawn over the stadium photo. Built from code (no models or textures).
 */
export const BALL_RADIUS = 0.16;
/** Where the ball may sit: the open pitch right of the menu, below the preview. */
export const PITCH = { minX: -0.1, maxX: 2.3, minZ: 1.6, maxZ: 2.6 } as const;

export interface Spot {
  x: number;
  z: number;
}

/** The ball's spot for the selected section: left to right, gently zigzagging. */
export function ballTargetFor(index: number, count: number): Spot {
  const n = Math.max(1, Math.floor(count));
  const i = Math.min(Math.max(Math.floor(index), 0), n - 1);
  const t = n === 1 ? 0.5 : i / (n - 1);
  return {
    x: PITCH.minX + (PITCH.maxX - PITCH.minX) * t,
    z: PITCH.minZ + (PITCH.maxZ - PITCH.minZ) * (0.5 + 0.5 * Math.sin(i * 2.1)),
  };
}

/** Small seeded PRNG, so the dust looks the same on every visit. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Dust motes, gathered in two floodlight beams that fall from the top
 * corners and spread towards the pitch.
 */
export function dustField(count: number, seed = 7) {
  const rand = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const side = rand() < 0.5 ? -1 : 1;
    const y = 5 * Math.sqrt(rand()); // denser up high, near the lights
    const spread = 0.8 + (5 - y) * 0.5; // beams widen as they fall
    const x = side * (2.2 + y * 0.6) + (rand() * 2 - 1) * spread;
    positions[i * 3] = Math.max(-7, Math.min(7, x));
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = -6 + rand() * 7;
    seeds[i] = rand();
  }
  return { positions, seeds };
}

// Pentagon centres of a classic ball = the 12 vertices of an icosahedron.
const PHI = (1 + Math.sqrt(5)) / 2;
const PENTAGONS = [
  [0, 1, PHI],
  [0, -1, PHI],
  [0, 1, -PHI],
  [0, -1, -PHI],
  [1, PHI, 0],
  [-1, PHI, 0],
  [1, -PHI, 0],
  [-1, -PHI, 0],
  [PHI, 0, 1],
  [-PHI, 0, 1],
  [PHI, 0, -1],
  [-PHI, 0, -1],
].map(([x, y, z]) => new Vector3(x, y, z).normalize());
const PATCH = Math.cos(0.36); // angular radius of each dark patch

/** A sphere coloured face by face: white panels with dark pentagon patches. */
function footballGeometry(radius: number) {
  const geometry = new IcosahedronGeometry(radius, 4);
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count * 3);
  const white = new Color('#f2f3f5');
  const dark = new Color('#1b1e25');
  const centre = new Vector3();
  const corner = new Vector3();
  for (let v = 0; v < position.count; v += 3) {
    centre.set(0, 0, 0);
    for (let k = 0; k < 3; k++) centre.add(corner.fromBufferAttribute(position, v + k));
    centre.normalize();
    const isPatch = PENTAGONS.some((p) => p.dot(centre) > PATCH);
    const color = isPatch ? dark : white;
    for (let k = 0; k < 3; k++) color.toArray(colors, (v + k) * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
}

const DUST_VERTEX = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float phase = aSeed * 6.2831;
    p.x += sin(uTime * 0.12 + phase) * 0.35;
    p.y += sin(uTime * 0.09 + phase * 1.7) * 0.25;
    p.z += cos(uTime * 0.1 + phase) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.2 + aSeed * 3.4) * uPixelRatio * (7.0 / -mv.z);
    vAlpha = (0.35 + 0.6 * aSeed) * (0.65 + 0.35 * sin(uTime * 0.8 + phase * 3.0));
  }
`;
const DUST_FRAGMENT = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float soft = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(1.0, 0.96, 0.86, soft * vAlpha);
  }
`;
const SHADOW_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    gl_FragColor = vec4(0.0, 0.0, 0.0, smoothstep(1.0, 0.1, d) * 0.55);
  }
`;
const UV_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function buildStadiumScene({ dustCount = 700 }: { dustCount?: number } = {}) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 16 / 10, 0.1, 60);
  camera.position.set(0, 1.5, 6.4);
  const lookAt = new Vector3(0.6, 1.05, 0);
  camera.lookAt(lookAt);

  scene.add(new HemisphereLight('#dfe8ff', '#1d2a14', 1.15));
  const flood = new DirectionalLight('#ffffff', 2.4);
  flood.position.set(-4, 7, 4);
  scene.add(flood);

  const ballMaterial = new MeshStandardMaterial({ vertexColors: true, roughness: 0.5 });
  const ball = new Mesh(footballGeometry(BALL_RADIUS), ballMaterial);
  ball.name = 'ball';
  ball.position.y = BALL_RADIUS;
  ball.rotation.set(0.4, 0.8, 0.2);
  scene.add(ball);

  const shadowMaterial = new ShaderMaterial({
    vertexShader: UV_VERTEX,
    fragmentShader: SHADOW_FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
  const shadow = new Mesh(new CircleGeometry(BALL_RADIUS * 1.25, 32), shadowMaterial);
  shadow.name = 'shadow';
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  scene.add(shadow);

  const { positions, seeds } = dustField(dustCount);
  const dustGeometry = new BufferGeometry();
  dustGeometry.setAttribute('position', new BufferAttribute(positions, 3));
  dustGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const dustMaterial = new ShaderMaterial({
    vertexShader: DUST_VERTEX,
    fragmentShader: DUST_FRAGMENT,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const dust = new Points(dustGeometry, dustMaterial);
  dust.name = 'dust';
  scene.add(dust);

  const placeBall = ({ x, z }: Spot) => {
    ball.position.x = x;
    ball.position.z = z;
    shadow.position.x = x;
    shadow.position.z = z;
  };

  const axis = new Vector3();
  /**
   * One animation step: the ball rolls towards `target` (spinning by the
   * distance it travels), the dust drifts and the camera sways a little
   * towards the selected section (`sway` from -1 to 1).
   */
  const step = (dt: number, target: Spot, sway: number, time: number) => {
    const ease = 1 - Math.exp(-dt * 3.2);
    const dx = (target.x - ball.position.x) * ease;
    const dz = (target.z - ball.position.z) * ease;
    const distance = Math.hypot(dx, dz);
    if (distance > 1e-5) {
      axis.set(dz, 0, -dx).normalize();
      ball.rotateOnWorldAxis(axis, distance / BALL_RADIUS);
      placeBall({ x: ball.position.x + dx, z: ball.position.z + dz });
    }
    camera.position.x += (sway * 0.35 - camera.position.x) * (1 - Math.exp(-dt * 1.5));
    camera.lookAt(lookAt);
    dustMaterial.uniforms.uTime!.value = time;
  };

  const setPixelRatio = (ratio: number) => {
    dustMaterial.uniforms.uPixelRatio!.value = ratio;
  };

  const dispose = () => {
    ball.geometry.dispose();
    ballMaterial.dispose();
    shadow.geometry.dispose();
    shadowMaterial.dispose();
    dustGeometry.dispose();
    dustMaterial.dispose();
  };

  return { scene, camera, ball, dust, placeBall, step, setPixelRatio, dispose };
}
