"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { LayoutPage } from "@/lib/layout"
import { loadLayouts, saveLayouts, normalizeLayouts } from "@/lib/layout"

interface WidgetPosition {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

interface LayoutConfig {
  [breakpoint: string]: WidgetPosition[]
}

interface UseSwitchableGridOptions {
  page: LayoutPage
  defaultLayouts: LayoutConfig
  widgetIds: string[]
}

export function useSwitchableGrid({ page, defaultLayouts, widgetIds }: UseSwitchableGridOptions) {
  const [layouts, setLayouts] = useState<LayoutConfig>(defaultLayouts)
  const [loaded, setLoaded] = useState(false)
  const [switchMode, setSwitchMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const layoutsRef = useRef(layouts)
  layoutsRef.current = layouts

  useEffect(() => {
    const loaded = loadLayouts(page, defaultLayouts)
    setLayouts(loaded)
    setLoaded(true)
  }, [page, defaultLayouts])

  useEffect(() => {
    if (!loaded) return
    const flush = () => saveLayouts(page, layoutsRef.current)
    window.addEventListener("beforeunload", flush)
    return () => window.removeEventListener("beforeunload", flush)
  }, [page, loaded])

  const handleWidgetClick = useCallback((id: string) => {
    if (!switchMode) return

    if (selectedId === null) {
      setSelectedId(id)
    } else if (selectedId === id) {
      setSelectedId(null)
    } else {
      setLayouts(prev => {
        const next: LayoutConfig = {}
        for (const [bp, layout] of Object.entries(prev)) {
          const aIdx = layout.findIndex(item => item.i === selectedId)
          const bIdx = layout.findIndex(item => item.i === id)

          if (aIdx === -1 || bIdx === -1) {
            next[bp] = [...layout]
            continue
          }

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

  const resetLayout = useCallback(() => {
    const normalized = normalizeLayouts(defaultLayouts)
    setLayouts(normalized)
    saveLayouts(page, normalized)
    setSelectedId(null)
    setSwitchMode(false)
  }, [defaultLayouts, page])

  return {
    layouts,
    loaded,
    switchMode,
    setSwitchMode,
    selectedId,
    handleWidgetClick,
    resetLayout,
  }
}
