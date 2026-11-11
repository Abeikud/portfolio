/**
 * When the 3D layer may run. Kept free of three.js so the main bundle can ask
 * without downloading it.
 */
export const MIN_WIDTH = 768;
export const WIDE_QUERY = `(min-width: ${MIN_WIDTH}px)`;

export interface RenderConditions {
  webgl: boolean;
  reducedMotion: boolean;
  /** The "3D effects" switch in Settings. */
  enabled: boolean;
  /** The browser asked to save data (Data Saver / Low Data Mode). */
  saveData: boolean;
  /** At least MIN_WIDTH wide: phones keep the photo only. */
  wide: boolean;
}

export function shouldRender3D(c: RenderConditions): boolean {
  return c.webgl && !c.reducedMotion && c.enabled && !c.saveData && c.wide;
}

/**
 * Software-rendered WebGL (no GPU, or a blocklisted one) can freeze the page
 * for seconds: far too costly for a decorative layer, so it's refused. The
 * e2e tests opt in with this key, because CI machines have no GPU.
 */
export const ALLOW_SOFTWARE_KEY = 'dd:allow-software-3d';

export function allowSoftwareRendering(): boolean {
  try {
    return localStorage.getItem(ALLOW_SOFTWARE_KEY) === '1';
  } catch {
    return false;
  }
}

/** WebGL context options shared by the probe and the renderer. */
export const contextOptions = () => ({
  failIfMajorPerformanceCaveat: !allowSoftwareRendering(),
});

/** Renderer names of WebGL drawn on the CPU instead of a GPU. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;
export const isSoftwareRenderer = (name: string): boolean => SOFTWARE_RENDERER.test(name);

/** The GPU's name. Chrome and Safari mask RENDERER, so ask the debug extension there. */
function rendererName(gl: WebGLRenderingContext): string {
  const plain = String(gl.getParameter(gl.RENDERER));
  if (!/^webkit webgl$/i.test(plain)) return plain;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : plain;
}

let webgl: boolean | undefined;

/** Whether this browser can draw WebGL on a GPU (checked once, then remembered). */
export function hasWebGL(): boolean {
  if (webgl !== undefined) return webgl;
  if (typeof WebGLRenderingContext === 'undefined') return (webgl = false);
  try {
    const canvas = document.createElement('canvas');
    const options = contextOptions();
    const gl = (canvas.getContext('webgl2', options) ??
      canvas.getContext('webgl', options)) as WebGLRenderingContext | null;
    webgl = gl !== null && (allowSoftwareRendering() || !isSoftwareRenderer(rendererName(gl)));
    gl?.getExtension('WEBGL_lose_context')?.loseContext(); // free the probe
  } catch {
    webgl = false;
  }
  return webgl;
}

export function prefersSaveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}
