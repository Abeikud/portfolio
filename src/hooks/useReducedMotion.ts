import { useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '../app/playerContext';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerSnapshot = () => false;

/**
 * True when the OS asks for less motion, or the visitor switched it on in
 * Settings. Updates live. Works without a PlayerProvider (OS only).
 */
export function useReducedMotion(): boolean {
  const os = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const player = useContext(PlayerContext);
  return os || (player?.reduceMotion ?? false);
}
