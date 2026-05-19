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

interface UseGridLayoutOptions {
  page: LayoutPage
  defaultLayouts: Layouts
}

export function useGridLayout({ page, defaultLayouts }: UseGridLayoutOptions) {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts)
  const [loaded, setLoaded]   = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const layoutsRef   = useRef<Layouts>(layouts)
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

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: Layouts) => {
      if (!loaded) return
      const merged     = mergeLayoutsPreservingHidden(layoutsRef.current, allLayouts)
      const normalized = normalizeLayouts(merged)
      setLayouts(normalized)
      layoutsRef.current = normalized
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => saveLayouts(page, normalized), 300)
    },
    [page, loaded]
  )

  return { layouts, handleLayoutChange, loaded }
}
