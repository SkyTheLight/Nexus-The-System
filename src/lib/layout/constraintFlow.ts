import type { Layout, Layouts, LayoutItem } from 'react-grid-layout'
import type { LayoutPage } from './storage'
import { LAYOUT_STORAGE_KEYS } from './constants'

export interface WidgetConstraint {
  id: string
  preferW: number
  minW: number
  maxW: number
  minH: number
  maxH: number
  order: number
}

/* ── Storage ── */

const STORAGE_KEY: Record<LayoutPage, string> = {
  main: 'adversity-main-constraints-v1',
  hub: 'adversity-hub-constraints-v1',
}

function readRaw(page: LayoutPage): WidgetConstraint[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY[page])
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function readPositions(page: LayoutPage): Layouts | null {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEYS[page])
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function loadConstraints(page: LayoutPage, defaults: WidgetConstraint[]): WidgetConstraint[] {
  const fromV1 = readRaw(page)
  if (fromV1) return fromV1

  const fromPositions = readPositions(page)
  if (fromPositions) {
    const converted = layoutToConstraints(fromPositions.lg ?? [])
    saveConstraints(page, converted)
    return converted
  }

  return defaults
}

export function saveConstraints(page: LayoutPage, constraints: WidgetConstraint[]) {
  try { localStorage.setItem(STORAGE_KEY[page], JSON.stringify(constraints)) } catch {}
}

/* ── Layout → Constraints (migration) ── */

export function layoutToConstraints(layout: Layout): WidgetConstraint[] {
  return [...layout]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((item, i) => ({
      id: item.i,
      preferW: item.w,
      minW: item.minW ?? 1,
      maxW: item.maxW ?? 12,
      minH: item.minH ?? item.h,
      maxH: item.maxH ?? 12,
      order: i,
    }))
}

/* ── Skyline engine ── */

const COLS_MAP: Record<string, number> = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

/**
 * Place a single sorted constraint array into `cols` columns
 * using a skyline (column-height) packer.
 * Returns placed LayoutItems — RGL-compatible.
 */
export function constraintsToLayout(
  constraints: WidgetConstraint[],
  cols: number,
): Layout {
  const sorted = [...constraints].sort((a, b) => a.order - b.order)
  const colHeight = new Array(cols).fill(0)
  const out: Layout = []

  for (const c of sorted) {
    const maxW = Math.min(c.maxW, cols)
    const minW = Math.max(Math.min(c.minW, c.maxW, cols), 1)
    const preferW = Math.max(Math.min(c.preferW, maxW), minW)

    let bestX = 0
    let bestY = Infinity
    let bestW = preferW

    for (let tryW = preferW; tryW >= minW; tryW--) {
      for (let x = 0; x <= cols - tryW; x++) {
        let maxY = 0
        for (let cc = x; cc < x + tryW; cc++) {
          if (colHeight[cc] > maxY) maxY = colHeight[cc]
        }
        if (maxY < bestY || (maxY === bestY && tryW > bestW)) {
          bestY = maxY; bestX = x; bestW = tryW
        }
      }
    }

    out.push({ i: c.id, x: bestX, y: bestY, w: bestW, h: c.minH })
    for (let x = bestX; x < bestX + bestW; x++) colHeight[x] = bestY + c.minH
  }

  return out
}

/** Compute all breakpoint layouts from a single constraint set. */
export function constraintsToLayouts(constraints: WidgetConstraint[]): Layouts {
  const out: Layouts = {}
  for (const [bp, cols] of Object.entries(COLS_MAP)) {
    out[bp] = constraintsToLayout(constraints, cols)
  }
  return out
}

/* ── Constraints ← Positions (user-drag reconciliation) ── */

/**
 * Take the post-drag RGL layout and update constraint orders + sizes.
 * Only the ids present in `layout` get their order reassigned;
 * hidden (missing) constraints keep their existing order.
 */
export function updateConstraintsFromPositions(
  layout: Layout,
  existing: WidgetConstraint[],
): WidgetConstraint[] {
  const map = new Map(existing.map(c => [c.id, c]))
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x)
  const updated: WidgetConstraint[] = []
  const touched = new Set<string>()

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]
    const prev = map.get(item.i)
    updated.push({
      id: item.i,
      preferW: prev?.preferW ?? item.w,
      minW: prev?.minW ?? 1,
      maxW: prev?.maxW ?? 12,
      minH: prev?.minH ?? item.h,
      maxH: prev?.maxH ?? 12,
      order: i,
    })
    touched.add(item.i)
  }

  // Untouched (hidden) widgets keep old order; renumber above visible range
  const untouched = existing.filter(c => !touched.has(c.id)).sort((a, b) => a.order - b.order)
  const baseOrder = sorted.length
  for (let i = 0; i < untouched.length; i++) {
    updated.push({ ...untouched[i], order: baseOrder + i })
  }

  return updated
}
