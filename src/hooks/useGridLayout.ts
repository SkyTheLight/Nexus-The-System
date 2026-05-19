"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import type { Layout, Layouts } from "react-grid-layout"
import {
  loadConstraints,
  saveConstraints,
  constraintsToLayouts,
  updateConstraintsFromPositions,
  layoutToConstraints,
  type LayoutPage,
  type WidgetConstraint,
} from "@/lib/layout"

interface UseGridLayoutOptions {
  page: LayoutPage
  defaultLayouts: Layouts
  widgetIds?: string[]
}

function defaultsToConstraints(defaultLayouts: Layouts): WidgetConstraint[] {
  return layoutToConstraints(defaultLayouts.lg ?? [])
}

export function useGridLayout({ page, defaultLayouts, widgetIds = [] }: UseGridLayoutOptions) {
  const [constraints, setConstraints] = useState<WidgetConstraint[]>(() =>
    defaultsToConstraints(defaultLayouts)
  )
  const [loaded, setLoaded] = useState(false)
  const [switchMode, setSwitchMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [gridOverlay, setGridOverlay] = useState(false)
  const constraintsRef = useRef<WidgetConstraint[]>(constraints)
  constraintsRef.current = constraints
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Compute positions from constraints whenever they change */
  const visibleConstraints = useMemo(
    () => widgetIds.length > 0
      ? constraints.filter(c => widgetIds.includes(c.id))
      : constraints,
    [constraints, widgetIds]
  )
  const layouts = useMemo(() => constraintsToLayouts(visibleConstraints), [visibleConstraints])

  useEffect(() => {
    const defaults = defaultsToConstraints(defaultLayouts)
    setConstraints(loadConstraints(page, defaults))
    setLoaded(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!loaded) return
    const flush = () => saveConstraints(page, constraintsRef.current)
    window.addEventListener("beforeunload", flush)
    return () => {
      window.removeEventListener("beforeunload", flush)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [page, loaded])

  const persistConstraints = useCallback((next: WidgetConstraint[]) => {
    setConstraints(next)
    constraintsRef.current = next
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveConstraints(page, next), 300)
  }, [page])

  /* ── Drag / resize ── */
  const handleLayoutChange = useCallback(
    (currentLayout: Layout[], _allLayouts: Layouts) => {
      if (!loaded) return
      const next = updateConstraintsFromPositions(currentLayout, constraintsRef.current)
      persistConstraints(next)
    },
    [page, loaded, persistConstraints]
  )

  /* ── Swap two widgets ── */
  const handleWidgetClick = useCallback((id: string) => {
    if (!switchMode) return

    if (selectedId === null) {
      setSelectedId(id)
    } else if (selectedId === id) {
      setSelectedId(null)
    } else {
      setConstraints(prev => {
        const a = prev.find(c => c.id === selectedId)
        const b = prev.find(c => c.id === id)
        if (!a || !b) return prev

        const next = prev.map(c => {
          if (c.id === selectedId) return { ...c, order: b.order }
          if (c.id === id) return { ...c, order: a.order }
          return c
        })
        saveConstraints(page, next)
        constraintsRef.current = next
        return next
      })
      setSelectedId(null)
    }
  }, [switchMode, selectedId, page])

  /* ── Reset ── */
  const resetLayout = useCallback(() => {
    const defaults = defaultsToConstraints(defaultLayouts)
    setConstraints(defaults)
    constraintsRef.current = defaults
    saveConstraints(page, defaults)
    setSelectedId(null)
    setSwitchMode(false)
  }, [defaultLayouts, page])

  /* ── Shuffle ── */
  const shuffleLayout = useCallback(() => {
    setConstraints(prev => {
      const ids = widgetIds.length > 0 ? widgetIds : prev.map(c => c.id)
      const toShuffle = prev.filter(c => ids.includes(c.id))
      const untouched = prev.filter(c => !ids.includes(c.id))

      // Fisher-Yates on orders
      const orders = toShuffle.map(c => c.order)
      for (let i = orders.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[orders[i], orders[j]] = [orders[j], orders[i]]
      }

      const shuffled = toShuffle.map((c, i) => ({ ...c, order: orders[i] }))
      const next = [...shuffled, ...untouched].sort((a, b) => a.order - b.order)
      saveConstraints(page, next)
      constraintsRef.current = next
      return next
    })
  }, [page, widgetIds])

  /* ── Preset ── */
  const applyPreset = useCallback((preset: 'compact' | 'balanced' | 'spacious') => {
    const sizeMap: Record<string, { w: number; h: number }> = {
      compact:  { w: 3, h: 3 },
      balanced: { w: 4, h: 5 },
      spacious: { w: 6, h: 7 },
    }
    const { w, h } = sizeMap[preset]

    setConstraints(prev => {
      const next = prev.map(c => ({
        ...c,
        preferW: Math.min(w, c.maxW),
        minH: Math.min(h, c.maxH),
      }))
      saveConstraints(page, next)
      constraintsRef.current = next
      return next
    })
  }, [page])

  /* ── Resize widget ── */
  const resizeWidget = useCallback((id: string, size: 'small' | 'medium' | 'large' | 'wide') => {
    const sizeMap: Record<string, { w: number; h: number }> = {
      small:  { w: 3, h: 3 },
      medium: { w: 4, h: 5 },
      large:  { w: 6, h: 7 },
      wide:   { w: 12, h: 4 },
    }
    const { w, h } = sizeMap[size]

    setConstraints(prev => {
      const next = prev.map(c => {
        if (c.id !== id) return c
        return {
          ...c,
          preferW: Math.min(w, c.maxW),
          minH: Math.min(h, c.maxH),
        }
      })
      saveConstraints(page, next)
      constraintsRef.current = next
      return next
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
