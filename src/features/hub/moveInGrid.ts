export type GridMove = 'up' | 'down' | 'left' | 'right';

/**
 * Next index for a 2D move in a row-major grid. Moves stop at the edges
 * (no wrapping). Moving down onto a short last row lands on its last tile.
 */
export function moveInGrid(index: number, move: GridMove, count: number, columns: number): number {
  if (count === 0) return index;
  const cols = Math.max(1, columns);
  const column = index % cols;
  const lastRow = Math.floor((count - 1) / cols);
  const row = Math.floor(index / cols);

  switch (move) {
    case 'left':
      return column > 0 ? index - 1 : index;
    case 'right':
      return column < cols - 1 && index + 1 < count ? index + 1 : index;
    case 'up':
      return row > 0 ? index - cols : index;
    case 'down':
      if (row === lastRow) return index;
      return Math.min(index + cols, count - 1);
  }
}
