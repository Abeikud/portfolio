import { createContext, useContext, useMemo } from 'react';

/**
 * Per-screen memory that survives navigation: what was selected on a screen,
 * and whether the user is about to come back to it (so it can restore focus).
 * Keys are screen ids like 'menu', 'projects', 'projects:tab'.
 */
export interface ScreenMemoryStore {
  selected: Readonly<Record<string, string>>;
  returning: Readonly<Record<string, boolean>>;
  select: (screen: string, key: string) => void;
  markReturn: (screen: string) => void;
  clearReturn: (screen: string) => void;
}

export const ScreenMemoryContext = createContext<ScreenMemoryStore | null>(null);

export interface ScreenMemory {
  selected: string | undefined;
  /** True after leaving to a child screen, until this screen clears it. */
  returnPending: boolean;
  select: (key: string) => void;
  markReturn: () => void;
  clearReturn: () => void;
}

export function useScreenMemory(screen: string): ScreenMemory {
  const store = useContext(ScreenMemoryContext);
  if (!store) throw new Error('useScreenMemory must be used inside <ScreenMemoryProvider>');
  const { select, markReturn, clearReturn } = store;

  // Stable callbacks per screen so effects depending on them don't re-run.
  const actions = useMemo(
    () => ({
      select: (key: string) => select(screen, key),
      markReturn: () => markReturn(screen),
      clearReturn: () => clearReturn(screen),
    }),
    [screen, select, markReturn, clearReturn],
  );

  return {
    selected: store.selected[screen],
    returnPending: store.returning[screen] ?? false,
    ...actions,
  };
}
