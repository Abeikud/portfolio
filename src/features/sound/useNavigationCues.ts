import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { playCue } from './uiSound';

/**
 * Plays "open" when the visitor goes deeper (a new screen is pushed) and
 * "back" when they return (Back, Esc, B, the browser's Back button). Watching
 * navigation covers keyboard, controller and touch in one place.
 */
export function useNavigationCues(): void {
  const { key } = useLocation();
  const type = useNavigationType();
  // Compare with the previous location (not the first one: going Back can
  // return to the very first history entry). The page load itself is silent.
  const shownKey = useRef(key);

  useEffect(() => {
    if (key === shownKey.current) return;
    shownKey.current = key;
    playCue(type === 'PUSH' ? 'open' : 'back');
  }, [key, type]);
}
