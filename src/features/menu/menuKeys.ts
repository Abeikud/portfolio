export type MenuIntent = 'next' | 'prev' | 'first' | 'last' | 'activate';

export type MenuKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'altKey' | 'ctrlKey' | 'metaKey' | 'repeat' | 'isComposing' | 'target'
>;

// Stub: implemented in the green step of Phase 2.
export function keyToIntent(event: MenuKeyEvent): MenuIntent | null {
  void event;
  return null;
}
