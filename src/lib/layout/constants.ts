/** Storage keys — hub and main are fully independent. */
export const LAYOUT_STORAGE_KEYS = {
  hub: 'adversity-hub-layout-v2',
  main: 'adversity-main-layout-v2',
} as const

/** Older keys migrated on first load when v2 is missing. */
export const LAYOUT_LEGACY_KEYS: Record<keyof typeof LAYOUT_STORAGE_KEYS, string[]> = {
  hub: ['adversity-hub-layout-v1', 'adversity-dashboard-layout'],
  main: ['adversity-main-layout-v1'],
}

export const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } as const

export const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } as const

/** Shared grid rhythm — 72px rows align widgets cleanly. */
export const GRID_ROW_HEIGHT = 72
export const GRID_MARGIN: [number, number] = [12, 12]
export const GRID_COLS_LG = 12

/** Drag anywhere on the widget shell; cancel on interactive + scroll areas. */
export const GRID_DRAG_CANCEL =
  'button, input, textarea, select, a, label, [role="button"], .widget-no-drag, .react-resizable-handle'

export const HUB_GRID = {
  rowHeight: GRID_ROW_HEIGHT,
  margin: GRID_MARGIN,
  cols: GRID_COLS_LG,
} as const

export const MAIN_GRID = {
  rowHeight: GRID_ROW_HEIGHT,
  margin: GRID_MARGIN,
  cols: GRID_COLS_LG,
} as const
