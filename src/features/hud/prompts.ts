export interface Prompt {
  keys: readonly string[];
  label: string;
}

/** Common prompts, shared so every screen words them the same way. */
export const PROMPTS = {
  navigate: { keys: ['↑', '↓'], label: 'Navigate' },
  select: { keys: ['⏎'], label: 'Select' },
  move: { keys: ['←↑↓→'], label: 'Move' },
  open: { keys: ['⏎'], label: 'Open' },
  tabs: { keys: ['Q', 'E'], label: 'Tabs' },
  rail: { keys: ['←'], label: 'Links & settings' },
} satisfies Record<string, Prompt>;
