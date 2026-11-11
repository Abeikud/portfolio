import { createContext, useContext } from 'react';
import type { SectionId } from '../content/types';

/** The visitor's "save file": progress, preferences, dismissed messages. */
export interface Player {
  visited: readonly SectionId[];
  markVisited: (id: SectionId) => void;
  reduceMotion: boolean;
  setReduceMotion: (on: boolean) => void;
  /** The 3D layer over the menu photo (on unless switched off). */
  effects3d: boolean;
  setEffects3d: (on: boolean) => void;
  isDismissed: (id: string) => boolean;
  dismiss: (id: string) => void;
}

export const PlayerContext = createContext<Player | null>(null);

export function usePlayer(): Player {
  const player = useContext(PlayerContext);
  if (!player) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return player;
}
