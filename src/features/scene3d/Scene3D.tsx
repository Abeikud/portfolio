import { useEffect, useRef, useState } from 'react';
import { WebGLRenderer } from 'three';
import { contextOptions } from './shouldRender3D';
import { ballTargetFor, buildStadiumScene } from './stadium';
import styles from './Scene3D.module.css';

export interface Scene3DProps {
  selected: number;
  count: number;
}

/**
 * The WebGL layer itself (its own lazy chunk, with three.js). Draws the
 * stadium scene over the photo until it unmounts; if WebGL fails or is lost
 * it removes itself and the photo carries on alone.
 */
export default function Scene3D({ selected, count }: Scene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selection = useRef({ selected, count });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    selection.current = { selected, count };
  }, [selected, count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        ...contextOptions(),
      });
    } catch {
      setFailed(true);
      return;
    }
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);

    const stage = buildStadiumScene();
    stage.setPixelRatio(pixelRatio);
    stage.placeBall(ballTargetFor(selection.current.selected, selection.current.count));

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      stage.camera.aspect = width / height;
      stage.camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const onLost = (event: Event) => {
      event.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    // Compile the shaders off the main thread where the browser can, then
    // animate. requestAnimationFrame already pauses while the tab is hidden.
    let frame = 0;
    let stopped = false;
    const animate = () => {
      if (stopped) return;
      const start = performance.now();
      let last = start;
      frame = requestAnimationFrame(function tick(now) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const { selected: index, count: total } = selection.current;
        const sway = total > 1 ? (index / (total - 1)) * 2 - 1 : 0;
        stage.step(dt, ballTargetFor(index, total), sway, (now - start) / 1000);
        renderer.render(stage.scene, stage.camera);
        frame = requestAnimationFrame(tick);
      });
    };
    if (renderer.extensions.has('KHR_parallel_shader_compile')) {
      renderer.compileAsync(stage.scene, stage.camera).then(animate, () => setFailed(true));
    } else {
      animate(); // shaders compile on the first frame instead
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      stage.dispose();
      renderer.dispose();
    };
  }, []);

  if (failed) return null;
  return <canvas ref={canvasRef} className={styles.canvas} data-scene3d="" aria-hidden="true" />;
}
