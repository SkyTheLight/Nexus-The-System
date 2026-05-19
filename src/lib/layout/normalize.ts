import type { LayoutItem, Layout, Layouts } from 'react-grid-layout'

function snap(item: LayoutItem): LayoutItem {
  return {
    ...item,
    x: Math.max(0, Math.round(item.x)),
    y: Math.max(0, Math.round(item.y)),
    w: Math.max(item.minW ?? 1, Math.round(item.w)),
    h: Math.max(item.minH ?? 1, Math.round(item.h)),
  }
}

/**
 * Compact a single breakpoint array both vertically and horizontally.
 * Uses a column-based approach: tracks the next free y per column,
 * so every widget is placed at the lowest possible y without gaps.
 */
function compactLayout(layout: Layout, cols: number): Layout {
  const colNextY: number[] = Array(cols).fill(0)
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x)
  const placed: Layout = []

  for (const item of sorted) {
    const snapped = snap(item)
    const w = Math.min(snapped.w, cols)
    const x = Math.min(snapped.x, cols - w)

    // Find the lowest Y we can place this item without overlap
    let bestY = 0
    for (let col = x; col < x + w; col++) {
      bestY = Math.max(bestY, colNextY[col] ?? 0)
    }

    const placedItem: LayoutItem = { ...snapped, x, y: bestY, w }
    placed.push(placedItem)

    // Update column heights — mark all columns this item occupies
    for (let col = x; col < x + w; col++) {
      colNextY[col] = bestY + placedItem.h
    }
  }

  return placed
}

const COLS: Record<string, number> = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

export function normalizeLayouts(layouts: Layouts): Layouts {
  const result: Layouts = {}
  for (const [bp, layout] of Object.entries(layouts)) {
    if (!layout) continue
    result[bp] = compactLayout(layout, COLS[bp] ?? 12)
  }
  return result
}
