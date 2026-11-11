import { lazy, Suspense, useContext } from 'react';
import { PlayerContext } from '../../app/playerContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { hasWebGL, prefersSaveData, shouldRender3D, WIDE_QUERY } from './shouldRender3D';

// three.js (about 130 KB gzipped) is only downloaded when the layer can show.
const Scene3D = lazy(() => import('./Scene3D'));

/** The optional 3D layer over the main-menu photo, when it won't hurt. */
export function Scene3DLayer({ selected, count }: { selected: number; count: number }) {
  const reducedMotion = useReducedMotion();
  const enabled = useContext(PlayerContext)?.effects3d ?? true;
  const wide = useMediaQuery(WIDE_QUERY);

  // Cheap checks first; WebGL is only probed once everything else allows it.
  const allowed = !reducedMotion && enabled && wide && !prefersSaveData();
  const show =
    allowed && shouldRender3D({ webgl: hasWebGL(), reducedMotion, enabled, saveData: false, wide });
  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <Scene3D selected={selected} count={count} />
    </Suspense>
  );
}
