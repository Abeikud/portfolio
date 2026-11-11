import { useEffect } from 'react';
import { useScreenMemory, type ScreenMemory } from './screenMemory';

/**
 * A hub's memory, plus `restoring`: true on the render where the user has
 * just come back from one of its detail pages. The hub's grid uses it to
 * refocus the remembered tile; the flag is then cleared. (This effect runs
 * after the grid's own, because parent effects run after children's.)
 */
export function useHubMemory(screen: string): ScreenMemory & { restoring: boolean } {
  const memory = useScreenMemory(screen);
  const restoring = memory.returnPending;
  const { clearReturn } = memory;
  useEffect(() => {
    if (restoring) clearReturn();
  }, [restoring, clearReturn]);
  return { ...memory, restoring };
}

/** Called by a detail page so its hub restores `key` when the user goes back. */
export function useReturnToHub(screen: string, key: string | undefined): void {
  const { select, markReturn } = useScreenMemory(screen);
  useEffect(() => {
    if (!key) return;
    select(key);
    markReturn();
  }, [key, select, markReturn]);
}
