import { sections } from '../content/sections';
import type { SectionId } from '../content/types';
import { useScreenMemory } from './screenMemory';

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

/** The main menu's slice of screen memory. */
export function useMenuSelection(): MenuSelection {
  const memory = useScreenMemory('menu');
  return {
    selectedId: (memory.selected as SectionId | undefined) ?? sections[0]!.id,
    setSelectedId: memory.select,
    returnPending: memory.returnPending,
    markScreenVisit: memory.markReturn,
    clearReturn: memory.clearReturn,
  };
}
