import type { LayoutItem, Layouts } from 'react-grid-layout'

function snapItem(item: LayoutItem): LayoutItem {
  return {
    ...item,
    x: Math.max(0, Math.round(item.x)),
    y: Math.max(0, Math.round(item.y)),
    w: Math.max(item.minW ?? 1, Math.round(item.w)),
    h: Math.max(item.minH ?? 1, Math.round(item.h)),
  }
}

export function normalizeLayouts(layouts: Layouts): Layouts {
  const result: Layouts = {}
  for (const [bp, layout] of Object.entries(layouts)) {
    if (!layout) continue
    result[bp] = layout.map(snapItem)
  }
  return result
}
