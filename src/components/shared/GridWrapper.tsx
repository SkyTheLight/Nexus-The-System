"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import type { Layout, Layouts } from "react-grid-layout"
import { CustomGrid, type WidgetPixelPos } from "./CustomGrid"

const COLS = 12
const ROW_HEIGHT = 72
const MARGIN = 12

interface GridWrapperProps {
  layouts: Layouts
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void
  children: React.ReactNode
  rowHeight?: number
  margin?: [number, number]
  draggableHandle?: string
  onBreakpointChange?: (bp: string, cols: number) => void
}

/* ── Grid units ↔ Pixels ── */
function gridToPixels(
  layout: Layout,
  containerWidth: number,
  cols: number,
  rowHeight: number,
  margin: number
): Record<string, WidgetPixelPos> {
  const colWidth = (containerWidth - margin * (cols - 1)) / cols
  const out: Record<string, WidgetPixelPos> = {}
  for (const item of layout) {
    out[item.i] = {
      x: item.x * (colWidth + margin),
      y: item.y * (rowHeight + margin),
      w: item.w * colWidth + (item.w - 1) * margin,
      h: item.h * rowHeight + (item.h - 1) * margin,
    }
  }
  return out
}

function pixelToGrid(
  px: number,
  py: number,
  pw: number,
  ph: number,
  containerWidth: number,
  cols: number,
  rowHeight: number,
  margin: number
) {
  const colWidth = (containerWidth - margin * (cols - 1)) / cols
  return {
    x: Math.max(0, Math.round(px / (colWidth + margin))),
    y: Math.max(0, Math.round(py / (rowHeight + margin))),
    w: Math.max(1, Math.min(cols, Math.round((pw + margin) / (colWidth + margin)))),
    h: Math.max(1, Math.round((ph + margin) / (rowHeight + margin))),
  }
}

export function GridWrapper({
  layouts,
  onLayoutChange,
  children,
  rowHeight = ROW_HEIGHT,
  margin = [MARGIN, MARGIN] as [number, number],
}: GridWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [ready, setReady] = useState(false)
  const layoutsRef = useRef(layouts)
  const ignoreNextLayoutRef = useRef(false)
  const [pixelPos, setPixelPos] = useState<Record<string, WidgetPixelPos>>({})

  layoutsRef.current = layouts

  const measure = useCallback(() => {
    const w = containerRef.current?.getBoundingClientRect().width ?? 0
    if (w > 0) setWidth(w)
  }, [])

  /* Init: convert grid layouts → pixel positions */
  useEffect(() => {
    setReady(true)
    measure()
    const t1 = setTimeout(measure, 60)
    const t2 = setTimeout(measure, 300)
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener("resize", measure)
    return () => {
      clearTimeout(t1); clearTimeout(t2); ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure])

  /* Re-compute pixel positions when layouts change externally (not from our own drag) */
  useEffect(() => {
    if (!ready || width === 0) return
    // Don't re-compute when the change came from onLayoutChange (we already have pixel data)
    if (ignoreNextLayoutRef.current) {
      ignoreNextLayoutRef.current = false
      return
    }
    const lg = layouts.lg ?? []
    setPixelPos(gridToPixels(lg, width, COLS, rowHeight, margin[0]))
  }, [layouts, ready, width, rowHeight, margin])

  const handleInteractionEnd = useCallback(
    (id: string, pos: WidgetPixelPos) => {
      const lg = layoutsRef.current.lg ?? []
      const grid = pixelToGrid(pos.x, pos.y, pos.w, pos.h, width, COLS, rowHeight, margin[0])
      const newLg = lg.map(item =>
        item.i === id
          ? { ...item, x: grid.x, y: grid.y, w: grid.w, h: grid.h }
          : item
      )
      const newLayouts: Layouts = { ...layoutsRef.current, lg: newLg }
      ignoreNextLayoutRef.current = true
      onLayoutChange(newLg, newLayouts)
    },
    [width, onLayoutChange, rowHeight, margin]
  )

  const handlePositionChange = useCallback((id: string, pos: WidgetPixelPos) => {
    setPixelPos(prev => ({ ...prev, [id]: pos }))
  }, [])

  const totalHeight = useMemo(() => {
    const h = Object.values(pixelPos).reduce((max, p) => Math.max(max, p.y + p.h), 0)
    return h + 100
  }, [pixelPos])

  if (!ready) return <div ref={containerRef} style={{ width: "100%", minHeight: 400 }} />

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {width > 0 && (
        <CustomGrid
          positions={pixelPos}
          onPositionChange={handlePositionChange}
          onDragEnd={handleInteractionEnd}
          onResizeEnd={handleInteractionEnd}
        >
          {children}
        </CustomGrid>
      )}
    </div>
  )
}
