import { useMemo, useState, type ReactNode } from 'react';
import { sections } from '../content/sections';
import type { SectionId } from '../content/types';
import { MenuSelectionContext, type MenuSelection } from './menuSelectionContext';

/** Remembers the menu selection while the user moves between screens. */
export function MenuSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<SectionId>(sections[0]!.id);
  const [returnPending, setReturnPending] = useState(false);

  const value = useMemo<MenuSelection>(
    () => ({
      selectedId,
      setSelectedId,
      returnPending,
      markScreenVisit: () => setReturnPending(true),
      clearReturn: () => setReturnPending(false),
    }),
    [selectedId, returnPending],
  );

  return <MenuSelectionContext.Provider value={value}>{children}</MenuSelectionContext.Provider>;
}
