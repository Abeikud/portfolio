import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ScreenMemoryContext, type ScreenMemoryStore } from './screenMemory';

export function ScreenMemoryProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [returning, setReturning] = useState<Record<string, boolean>>({});

  // Updaters bail out (return prev) when nothing changes, so calling them
  // from effects never causes a render loop.
  const select = useCallback(
    (screen: string, key: string) =>
      setSelected((prev) => (prev[screen] === key ? prev : { ...prev, [screen]: key })),
    [],
  );
  const markReturn = useCallback(
    (screen: string) => setReturning((prev) => (prev[screen] ? prev : { ...prev, [screen]: true })),
    [],
  );
  const clearReturn = useCallback(
    (screen: string) =>
      setReturning((prev) => (prev[screen] ? { ...prev, [screen]: false } : prev)),
    [],
  );

  const store = useMemo<ScreenMemoryStore>(
    () => ({ selected, returning, select, markReturn, clearReturn }),
    [selected, returning, select, markReturn, clearReturn],
  );

  return <ScreenMemoryContext.Provider value={store}>{children}</ScreenMemoryContext.Provider>;
}
