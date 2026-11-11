/**
 * The scenes worth having in the DOM for a selection: the active one plus its
 * immediate neighbours (no wrap, matching the clamped menu).
 */
export function scenesToWarm<T extends string>(order: readonly T[], activeId: T): T[] {
  const index = order.indexOf(activeId);
  if (index === -1) return [];
  return order.slice(Math.max(0, index - 1), index + 2);
}
