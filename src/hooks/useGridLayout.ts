"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { Layout, Layouts } from "react-grid-layout"
import {
  loadLayouts,
  saveLayouts,
  normalizeLayouts,
  mergeLayoutsPreservingHidden,
  type LayoutPage,
} from "@/lib/layout"

interface PresetSizes {
  w: number
  h: number
}

interface UseGridLayoutOptions {
  page: LayoutPage
  defaultLayouts: Layouts
  widgetIds?: string[]
}

export function useGridLayout({ page, defaultLayouts, widgetIds = [] }: UseGridLayoutOptions) {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts)
  const [loaded, setLoaded] = useState(false)
  const [switchMode, setSwitchMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [gridOverlay, setGridOverlay] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const layoutsRef = useRef<Layouts>(layouts)
  layoutsRef.current = layouts

  useEffect(() => {
    const saved = loadLayouts(page, defaultLayouts)
    setLayouts(saved)
    setLoaded(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!loaded) return
    const flush = () => saveLayouts(page, layoutsRef.current)
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("beforeunload", flush)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [page, loaded])

  const persistLayout = useCallback((newLayouts: Layouts) => {
    const normalized = normalizeLayouts(newLayouts)
    setLayouts(normalized)
    layoutsRef.current = normalized
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveLayouts(page, normalized), 300)
  }, [page])

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: Layouts) => {
      if (!loaded) return
      const merged = mergeLayoutsPreservingHidden(layoutsRef.current, allLayouts)
      persistLayout(merged)
    },
    [page, loaded, persistLayout]
  )

  /* Swap two widgets */
  const handleWidgetClick = useCallback((id: string) => {
    if (!switchMode) return

    if (selectedId === null) {
      setSelectedId(id)
    } else if (selectedId === id) {
      setSelectedId(null)
    } else {
      setLayouts(prev => {
        const next: Layouts = {}
        for (const [bp, layout] of Object.entries(prev)) {
          if (!layout) { next[bp] = []; continue }
          const aIdx = layout.findIndex(item => item.i === selectedId)
          const bIdx = layout.findIndex(item => item.i === id)
          if (aIdx === -1 || bIdx === -1) { next[bp] = [...layout]; continue }
          const swapped = [...layout]
          const aPos = { x: swapped[aIdx].x, y: swapped[aIdx].y, w: swapped[aIdx].w, h: swapped[aIdx].h }
          const bPos = { x: swapped[bIdx].x, y: swapped[bIdx].y, w: swapped[bIdx].w, h: swapped[bIdx].h }
          swapped[aIdx] = { ...swapped[aIdx], x: bPos.x, y: bPos.y, w: bPos.w, h: bPos.h }
          swapped[bIdx] = { ...swapped[bIdx], x: aPos.x, y: aPos.y, w: aPos.w, h: aPos.h }
          next[bp] = swapped
        }
        const normalized = normalizeLayouts(next)
        saveLayouts(page, normalized)
        return normalized
      })
      setSelectedId(null)
    }
  }, [switchMode, selectedId, page])

  /* Reset to defaults */
  const resetLayout = useCallback(() => {
    const normalized = normalizeLayouts(defaultLayouts)
    setLayouts(normalized)
    layoutsRef.current = normalized
    saveLayouts(page, normalized)
    setSelectedId(null)
    setSwitchMode(false)
  }, [defaultLayouts, page])

  /* Shuffle: randomize positions within grid bounds */
  const shuffleLayout = useCallback(() => {
    setLayouts(prev => {
      const next: Layouts = {}
      const cols = 12
      const ids = widgetIds.length > 0 ? widgetIds : (prev.lg || []).map(l => l.i)

      for (const [bp, layout] of Object.entries(prev)) {
        if (!layout) { next[bp] = []; continue }
        const maxCol = bp === 'lg' ? 12 : bp === 'md' ? 10 : bp === 'sm' ? 6 : bp === 'xs' ? 4 : 2
        const shuffled = [...layout]

        /* Fisher-Yates shuffle positions */
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const temp = { x: shuffled[i].x, y: shuffled[i].y, w: shuffled[i].w, h: shuffled[i].h }
          shuffled[i] = { ...shuffled[i], x: shuffled[j].x, y: shuffled[j].y, w: shuffled[j].w, h: shuffled[j].h }
          shuffled[j] = { ...shuffled[j], ...temp }
        }

        /* Ensure no out-of-bounds */
        for (const item of shuffled) {
          if (item.x + item.w > maxCol) item.x = Math.max(0, maxCol - item.w)
          item.y = Math.max(0, item.y)
        }

        next[bp] = shuffled
      }
      const normalized = normalizeLayouts(next)
      saveLayouts(page, normalized)
      return normalized
    })
  }, [page, widgetIds])

  /* Apply preset */
  const applyPreset = useCallback((preset: 'compact' | 'balanced' | 'spacious') => {
    const sizeMap: Record<string, Record<string, PresetSizes>> = {
      compact:  { w: 3, h: 3 },
      balanced: { w: 4, h: 5 },
      spacious: { w: 6, h: 7 },
    }
    const { w, h } = sizeMap[preset]

    setLayouts(prev => {
      const next: Layouts = {}
      for (const [bp, layout] of Object.entries(prev)) {
        if (!layout) { next[bp] = []; continue }
        const maxCol = bp === 'lg' ? 12 : bp === 'md' ? 10 : bp === 'sm' ? 6 : bp === 'xs' ? 4 : 2
        let x = 0, y = 0
        next[bp] = layout.map(item => {
          const pos = { x, y, w: Math.min(item.w || w, maxCol), h: item.h || h }
          x += pos.w
          if (x >= maxCol) { x = 0; y += pos.h }
          return { ...item, ...pos }
        })
      }
      const normalized = normalizeLayouts(next)
      saveLayouts(page, normalized)
      return normalized
    })
  }, [page])

  /* Resize specific widget */
  const resizeWidget = useCallback((id: string, size: 'small' | 'medium' | 'large' | 'wide') => {
    const sizeMap: Record<string, PresetSizes> = {
      small:  { w: 3, h: 3 },
      medium: { w: 4, h: 5 },
      large:  { w: 6, h: 7 },
      wide:   { w: 12, h: 4 },
    }
    const { w, h } = sizeMap[size]

    setLayouts(prev => {
      const next: Layouts = {}
      for (const [bp, layout] of Object.entries(prev)) {
        if (!layout) { next[bp] = []; continue }
        const maxCol = bp === 'lg' ? 12 : bp === 'md' ? 10 : bp === 'sm' ? 6 : bp === 'xs' ? 4 : 2
        next[bp] = layout.map(item => {
          if (item.i === id) {
            const newW = Math.min(w, maxCol)
            const newX = item.x + newW > maxCol ? Math.max(0, maxCol - newW) : item.x
            return { ...item, w: newW, h, x: newX }
          }
          return item
        })
      }
      const normalized = normalizeLayouts(next)
      saveLayouts(page, normalized)
      return normalized
    })
  }, [page])

  return {
    layouts,
    handleLayoutChange,
    loaded,
    switchMode,
    setSwitchMode,
    selectedId,
    handleWidgetClick,
    resetLayout,
    shuffleLayout,
    applyPreset,
    resizeWidget,
    gridOverlay,
    setGridOverlay,
  }
}
