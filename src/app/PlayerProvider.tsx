import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SectionId } from '../content/types';
import { loadVisited, markVisited as addVisit, saveVisited } from '../features/hud/progress';
import { readJson, writeJson } from '../lib/storage';
import { PlayerContext, type Player } from './playerContext';

const PREFS_KEY = 'dd:prefs';
const DISMISSED_KEY = 'dd:dismissed';

function loadDismissed(): string[] {
  const raw = readJson<unknown>(DISMISSED_KEY, []);
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [visited, setVisited] = useState<readonly SectionId[]>(loadVisited);
  const [reduceMotion, setReduceMotion] = useState(
    () => readJson<{ reduceMotion?: unknown }>(PREFS_KEY, {}).reduceMotion === true,
  );
  const [dismissed, setDismissed] = useState<readonly string[]>(loadDismissed);

  useEffect(() => saveVisited(visited), [visited]);
  useEffect(() => writeJson(DISMISSED_KEY, dismissed), [dismissed]);
  useEffect(() => {
    writeJson(PREFS_KEY, { reduceMotion });
    // A global switch the CSS can key off (see global.css).
    if (reduceMotion) document.documentElement.dataset.motion = 'reduced';
    else delete document.documentElement.dataset.motion;
  }, [reduceMotion]);

  const markVisited = useCallback((id: SectionId) => setVisited((prev) => addVisit(prev, id)), []);
  const dismiss = useCallback(
    (id: string) => setDismissed((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [],
  );

  const player = useMemo<Player>(
    () => ({
      visited,
      markVisited,
      reduceMotion,
      setReduceMotion,
      isDismissed: (id) => dismissed.includes(id),
      dismiss,
    }),
    [visited, markVisited, reduceMotion, dismissed, dismiss],
  );

  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>;
}
