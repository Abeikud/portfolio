/**
 * jsdom has no matchMedia. This double lets tests flip media queries and
 * notifies subscribers the way a real MediaQueryList does.
 */
type Listener = (event: MediaQueryListEvent) => void;

const matches = new Map<string, boolean>();
const listeners = new Map<string, Set<Listener>>();

export function setMediaQuery(query: string, value: boolean): void {
  matches.set(query, value);
  for (const listener of listeners.get(query) ?? []) {
    listener({ matches: value, media: query } as MediaQueryListEvent);
  }
}

export function resetMediaQueries(): void {
  matches.clear();
  listeners.clear();
}

export function installMatchMedia(): void {
  window.matchMedia = (query: string) => {
    const set = listeners.get(query) ?? new Set<Listener>();
    listeners.set(query, set);
    return {
      media: query,
      get matches() {
        return matches.get(query) ?? false;
      },
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => set.add(listener),
      removeEventListener: (_type: string, listener: Listener) => set.delete(listener),
      addListener: (listener: Listener) => set.add(listener),
      removeListener: (listener: Listener) => set.delete(listener),
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  };
}
