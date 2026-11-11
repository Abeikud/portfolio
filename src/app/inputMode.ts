import { useSyncExternalStore } from 'react';

/** What the visitor last played with: drives which button prompts are shown. */
export type InputMode = 'keys' | 'pad';

let mode: InputMode = 'keys';
const listeners = new Set<() => void>();

export const getInputMode = (): InputMode => mode;

export function setInputMode(next: InputMode): void {
  if (next === mode) return;
  mode = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useInputMode(): InputMode {
  return useSyncExternalStore(subscribe, getInputMode, () => 'keys');
}
