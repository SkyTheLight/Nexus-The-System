"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { Layout, Layouts } from "react-grid-layout"
import {
  loadLayouts,
  saveLayouts,
  normalizeLayouts,
  type LayoutPage,
} from "@/lib/layout"

type BeforePersist = (stored: Layouts, incoming: Layouts) => Layouts

interface UseGridLayoutOptions {
  page: LayoutPage
  defaultLayouts: Layouts
  beforePersist?: BeforePersist
}

export function useGridLayout({ page, defaultLayouts, beforePersist }: UseGridLayoutOptions) {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts)
  const [loaded, setLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const layoutsRef = useRef(layouts)
  const beforePersistRef = useRef(beforePersist)
  layoutsRef.current = layouts
  beforePersistRef.current = beforePersist

  useEffect(() => {
    const loaded = loadLayouts(page, defaultLayouts)
    setLayouts(loaded)
    setLoaded(true)
  }, [page, defaultLayouts])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    const flush = () => saveLayouts(page, layoutsRef.current)
    window.addEventListener("beforeunload", flush)
    return () => window.removeEventListener("beforeunload", flush)
  }, [page, loaded])

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: Layouts) => {
      if (!loaded) return

      let next = allLayouts
      if (beforePersistRef.current) {
        next = beforePersistRef.current(layoutsRef.current, allLayouts)
      }
      const normalized = normalizeLayouts(next)
      setLayouts(normalized)

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveLayouts(page, normalized)
      }, 300)
    },
    [page, loaded]
  )

  return { layouts, handleLayoutChange, loaded }
}
