export const GRID_COLS = 12
export const ROW_HEIGHT = 80
export const GRID_GAP = 12

export const HEIGHT_TO_ROWS: Record<string, number> = {
  compact: 2,
  default: 4,
  tall: 6,
}

export function colsToPixels(cols: number, containerWidth: number) {
  const colWidth = (containerWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
  return cols * colWidth + (cols - 1) * GRID_GAP
}
