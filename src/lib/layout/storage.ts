import type { Layout, LayoutItem, Layouts } from 'react-grid-layout'
import { LAYOUT_LEGACY_KEYS, LAYOUT_STORAGE_KEYS } from './constants'
import { normalizeLayouts } from './normalize'

export type LayoutPage = keyof typeof LAYOUT_STORAGE_KEYS

function isLayoutItem(value: unknown): value is LayoutItem {
  if (!value || typeof value !== 'object') return false
  const item = value as LayoutItem
  return (
    typeof item.i === 'string' &&
    typeof item.x === 'number' &&
    typeof item.y === 'number' &&
    typeof item.w === 'number' &&
    typeof item.h === 'number'
  )
}

function isLayout(value: unknown): value is Layout {
  return Array.isArray(value) && value.every(isLayoutItem)
}

function isLayouts(value: unknown): value is Layouts {
  if (!value || typeof value !== 'object') return false
  const record = value as Layouts
  return Object.values(record).every(isLayout)
}

function readRaw(key: string): Layouts | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isLayouts(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function reconcileLayouts(
  saved: Layouts,
  defaults: Layouts
): Layouts {
  const result: Layouts = { ...defaults }

  for (const [breakpoint, defaultLayout] of Object.entries(defaults)) {
    const savedLayout = saved[breakpoint]
    if (!savedLayout) {
      result[breakpoint] = defaultLayout
      continue
    }

    if (!defaultLayout) {
      result[breakpoint] = savedLayout
      continue
    }

    const defaultById = new Map(defaultLayout.map(item => [item.i, item]))
    const savedById = new Map(savedLayout.map(item => [item.i, item]))
    const merged: LayoutItem[] = []

    for (const item of savedLayout) {
      const fallback = defaultById.get(item.i)
      merged.push(fallback ? { ...fallback, ...item } : item)
    }

    for (const item of defaultLayout) {
      if (!savedById.has(item.i)) merged.push(item)
    }

    result[breakpoint] = merged
  }

  return result
}

export function loadLayouts(page: LayoutPage, defaults: Layouts): Layouts {
  const primaryKey = LAYOUT_STORAGE_KEYS[page]
  const fromPrimary = readRaw(primaryKey)
  if (fromPrimary) return normalizeLayouts(reconcileLayouts(fromPrimary, defaults))

  for (const legacyKey of LAYOUT_LEGACY_KEYS[page]) {
    const fromLegacy = readRaw(legacyKey)
    if (fromLegacy) {
      const reconciled = reconcileLayouts(fromLegacy, defaults)
      const normalized = normalizeLayouts(reconciled)
      saveLayouts(page, normalized)
      return normalized
    }
  }

  return normalizeLayouts(defaults)
}

export function saveLayouts(page: LayoutPage, layouts: Layouts): void {
  if (typeof window === 'undefined') return
  try {
    const normalized = normalizeLayouts(layouts)
    localStorage.setItem(LAYOUT_STORAGE_KEYS[page], JSON.stringify(normalized))
  } catch {
    // quota / private mode
  }
}

export function hasSavedLayouts(page: LayoutPage): boolean {
  if (typeof window === 'undefined') return false
  return readRaw(LAYOUT_STORAGE_KEYS[page]) !== null
}
