'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { Layout } from 'react-grid-layout'
import { WIDGET_REGISTRY, DEFAULT_WIDGET_ORDER, STORAGE_KEY } from '@/lib/widgetRegistry'
import { HEIGHT_TO_ROWS } from '@/lib/gridUtils'

const META_KEY = 'adversity-widget-meta'

interface WidgetMeta {
  hidden: boolean
  deleted: boolean
}

function loadLayoutFromStorage(): Layout[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function loadMetaFromStorage(): Record<string, WidgetMeta> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function buildDefaultLayout(): Layout[] {
  return WIDGET_REGISTRY.map((w, i) => ({
    i: w.id,
    x: (i * 2) % 12,
    y: Math.floor(i / 6) * 4,
    w: w.defaultCols,
    h: HEIGHT_TO_ROWS[w.defaultHeight] || 4,
    minW: 1,
    minH: 2,
    maxW: 12,
  }))
}

function mergeLayouts(saved: Layout[], registry: typeof WIDGET_REGISTRY): Layout[] {
  const savedMap = new Map(saved.map(item => [item.i, item]))
  const defaultMap = new Map(buildDefaultLayout().map(item => [item.i, item]))
  return registry.map(w => {
    const s = savedMap.get(w.id)
    const d = defaultMap.get(w.id)
    if (s) return { ...d, ...s, i: w.id }
    return {
      i: w.id,
      x: 0,
      y: Infinity,
      w: w.defaultCols,
      h: HEIGHT_TO_ROWS[w.defaultHeight] || 4,
      minW: 1,
      minH: 2,
      maxW: 12,
    }
  })
}

function migrateLegacy(raw: any): { layout: Layout[]; meta: Record<string, WidgetMeta> } | null {
  if (!raw || !raw.sizes || !raw.order) return null
  const hiddenSet = new Set<string>(raw.hidden || [])
  const deletedSet = new Set<string>(raw.deleted || [])
  const meta: Record<string, WidgetMeta> = {}
  const layout: Layout[] = WIDGET_REGISTRY.map((w, i) => {
    const size = raw.sizes[w.id] || { cols: 2, height: 'default' }
    meta[w.id] = { hidden: hiddenSet.has(w.id), deleted: deletedSet.has(w.id) }
    return {
      i: w.id,
      x: (i * 2) % 12,
      y: Math.floor(i / 6) * 4,
      w: size.cols || w.defaultCols,
      h: HEIGHT_TO_ROWS[size.height || 'default'] || 4,
      minW: 1,
      minH: 2,
      maxW: 12,
    }
  })
  return { layout, meta }
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState<Layout[]>([])
  const [meta, setMeta] = useState<Record<string, WidgetMeta>>({})
  const [initialized, setInitialized] = useState(false)
  const hasSavedRef = useRef(false)

  useEffect(() => {
    const raw = loadLayoutFromStorage()
    const savedMeta = loadMetaFromStorage()

    if (raw && raw.length > 0) {
      const merged = mergeLayouts(raw, WIDGET_REGISTRY)
      setLayout(merged)
      setMeta(prev => ({ ...savedMeta, ...prev }))
      hasSavedRef.current = true
    } else {
      const rawOld = (() => {
        try {
          const r = localStorage.getItem(STORAGE_KEY)
          return r ? JSON.parse(r) : null
        } catch { return null }
      })()
      if (rawOld) {
        const migrated = migrateLegacy(rawOld)
        if (migrated) {
          setLayout(migrated.layout)
          setMeta(migrated.meta)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated.layout))
            localStorage.setItem(META_KEY, JSON.stringify(migrated.meta))
          } catch {}
          hasSavedRef.current = true
        } else {
          setLayout(buildDefaultLayout())
        }
      } else {
        setLayout(buildDefaultLayout())
      }
    }
    setInitialized(true)
  }, [])

  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout))
    } catch {}
  }, [])

  const persistMeta = useCallback((next: Record<string, WidgetMeta>) => {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(next))
    } catch {}
  }, [])

  const hideWidget = useCallback((id: string) => {
    setMeta(prev => {
      const next = { ...prev, [id]: { ...prev[id], hidden: true, deleted: false } }
      persistMeta(next)
      return next
    })
  }, [persistMeta])

  const showWidget = useCallback((id: string) => {
    setMeta(prev => {
      const next = { ...prev, [id]: { ...prev[id], hidden: false } }
      persistMeta(next)
      return next
    })
  }, [persistMeta])

  const deleteWidget = useCallback((id: string) => {
    setMeta(prev => {
      const next = { ...prev, [id]: { ...prev[id], deleted: true } }
      persistMeta(next)
      return next
    })
  }, [persistMeta])

  const restoreWidget = useCallback((id: string) => {
    setMeta(prev => {
      const next = { ...prev, [id]: { ...prev[id], deleted: false, hidden: false } }
      persistMeta(next)
      return next
    })
  }, [persistMeta])

  const addWidget = useCallback((id: string) => {
    const entry = WIDGET_REGISTRY.find(w => w.id === id)
    const newItem: Layout = {
      i: id,
      x: 0,
      y: Infinity,
      w: entry?.defaultCols || 2,
      h: HEIGHT_TO_ROWS[entry?.defaultHeight || 'default'] || 4,
      minW: 1,
      minH: 2,
      maxW: 12,
    }
    setLayout(prev => [...prev, newItem])
    setMeta(prev => {
      const next = { ...prev, [id]: { hidden: false, deleted: false } }
      persistMeta(next)
      return next
    })
    try {
      const updated = [...layout, newItem]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }, [layout, persistMeta])

  const visibleLayout = useMemo(
    () => layout.filter(item => {
      const m = meta[item.i]
      return !m?.hidden && !m?.deleted
    }),
    [layout, meta]
  )

  const hiddenList = useMemo(
    () => layout.filter(item => {
      const m = meta[item.i]
      return m?.hidden && !m?.deleted
    }).map(item => item.i),
    [layout, meta]
  )

  const deletedList = useMemo(
    () => layout.filter(item => {
      const m = meta[item.i]
      return m?.deleted
    }).map(item => item.i),
    [layout, meta]
  )

  return {
    layout,
    visibleLayout,
    visibleWidgets: visibleLayout.map(item => item.i),
    hiddenWidgets: hiddenList,
    deletedWidgets: deletedList,
    initialized,
    onLayoutChange,
    hideWidget,
    showWidget,
    deleteWidget,
    restoreWidget,
    addWidget,
  }
}
