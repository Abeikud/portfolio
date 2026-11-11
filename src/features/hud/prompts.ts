export interface Prompt {
  keys: readonly string[];
  /** The same control on a game controller. */
  pad: readonly string[];
  label: string;
}

/** Common prompts, shared so every screen words them the same way. */
export const PROMPTS = {
  navigate: { keys: ['↑', '↓'], pad: ['↑', '↓'], label: 'Navigate' },
  select: { keys: ['⏎'], pad: ['A'], label: 'Select' },
  move: { keys: ['←↑↓→'], pad: ['←↑↓→'], label: 'Move' },
  open: { keys: ['⏎'], pad: ['A'], label: 'Open' },
  tabs: { keys: ['Q', 'E'], pad: ['LB', 'RB'], label: 'Tabs' },
  rail: { keys: ['←'], pad: ['←'], label: 'Links & settings' },
} satisfies Record<string, Prompt>;
