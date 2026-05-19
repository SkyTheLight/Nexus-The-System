import type { Layout, LayoutItem, Layouts } from 'react-grid-layout'

export function layoutsForVisible(
  layouts: Layouts,
  visibleIds: readonly string[]
): Layouts {
  const visible = new Set(visibleIds)
  const result: Layouts = {}

  for (const [breakpoint, layout] of Object.entries(layouts)) {
    if (!layout) continue
    result[breakpoint] = layout.filter(item => visible.has(item.i))
  }

  return result
}

export function mergeLayoutsPreservingHidden(
  stored: Layouts,
  incoming: Layouts
): Layouts {
  const result: Layouts = { ...stored }

  for (const [breakpoint, nextLayout] of Object.entries(incoming)) {
    if (!nextLayout) continue

    const prevLayout = stored[breakpoint] ?? []
    const nextById = new Map(nextLayout.map(item => [item.i, item]))
    const merged: LayoutItem[] = []

    for (const item of prevLayout) {
      merged.push(nextById.get(item.i) ?? item)
    }

    for (const item of nextLayout) {
      if (!merged.some(m => m.i === item.i)) merged.push(item)
    }

    result[breakpoint] = merged
  }

  return result
}
