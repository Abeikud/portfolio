import { createContext, useContext } from 'react';
import type { SectionId } from '../content/types';

export interface MenuSelection {
  /** The section highlighted in the main menu (kept across screens). */
  selectedId: SectionId;
  setSelectedId: (id: SectionId) => void;
  /** True after a screen was shown, until the menu has restored focus. */
  returnPending: boolean;
  /** Screens call this so the menu knows the user is coming back to it. */
  markScreenVisit: () => void;
  /** The menu calls this once it has restored focus. */
  clearReturn: () => void;
}

export const MenuSelectionContext = createContext<MenuSelection | null>(null);

export function useMenuSelection(): MenuSelection {
  const value = useContext(MenuSelectionContext);
  if (!value) throw new Error('useMenuSelection must be used inside <MenuSelectionProvider>');
  return value;
}
