"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import type { Layout, Layouts } from "react-grid-layout"

interface LayoutPosition {
  x: number; y: number; width: number; height: number
}

interface GridWrapperProps {
  layouts: Layouts
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void
  children: React.ReactNode
  rowHeight?: number
  margin?: [number, number]
  draggableHandle?: string
  onBreakpointChange?: (bp: string, cols: number) => void
  persistenceKey?: string
}

const EDGE_THRESHOLD = 15
const MIN_SIZE = 100
const COLS = 12
const DEFAULT_ROW_HEIGHT = 72
const DEFAULT_MARGIN = 12

function loadPixelPositions(key: string): Map<string, LayoutPosition> | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, LayoutPosition>
      return new Map(Object.entries(obj))
    }
  } catch {}
  return null
}

function savePixelPositions(key: string, m: Map<string, LayoutPosition>) {
  try {
    const obj: Record<string, LayoutPosition> = {}
    m.forEach((pos, id) => { obj[id] = pos })
    localStorage.setItem(key, JSON.stringify(obj))
  } catch {}
}

function gridToPixels(
  layout: Layout[],
  containerWidth: number,
  cols: number,
  rowHeight: number,
  margin: number
): Map<string, LayoutPosition> {
  const colWidth = (containerWidth - margin * (cols - 1)) / cols
  const m = new Map<string, LayoutPosition>()
  for (const item of layout) {
    m.set(item.i, {
      x: item.x * (colWidth + margin),
      y: item.y * (rowHeight + margin),
      width: item.w * colWidth + (item.w - 1) * margin,
      height: item.h * rowHeight + (item.h - 1) * margin,
    })
  }
  return m
}

function pixelsToGrid(id: string, pos: LayoutPosition, containerWidth: number, cols: number, rowHeight: number, margin: number): Layout {
  const colWidth = (containerWidth - margin * (cols - 1)) / cols
  return [{
    i: id,
    x: Math.max(0, Math.round(pos.x / (colWidth + margin))),
    y: Math.max(0, Math.round(pos.y / (rowHeight + margin))),
    w: Math.max(1, Math.min(cols, Math.round((pos.width + margin) / (colWidth + margin)))),
    h: Math.max(1, Math.round((pos.height + margin) / (rowHeight + margin))),
  }]
}

export function GridWrapper({
  layouts,
  onLayoutChange,
  children,
  rowHeight = DEFAULT_ROW_HEIGHT,
  margin = [DEFAULT_MARGIN, DEFAULT_MARGIN] as [number, number],
  persistenceKey = "adversity-grid-pixels-v1",
}: GridWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [width, setWidth] = useState(0)
  const [widgets, setWidgets] = useState<Map<string, LayoutPosition>>(new Map())
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null)
  const [resizingWidget, setResizingWidget] = useState<string | null>(null)
  const [cursors, setCursors] = useState<Record<string, string>>({})
  const widgetsRef = useRef(widgets)
  widgetsRef.current = widgets

  const measure = useCallback(() => {
    const w = containerRef.current?.getBoundingClientRect().width ?? 0
    if (w > 0) setWidth(w)
  }, [])

  useEffect(() => {
    setMounted(true)
    measure()
    const t1 = setTimeout(measure, 50)
    const t2 = setTimeout(measure, 250)
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener("resize", measure)
    return () => { clearTimeout(t1); clearTimeout(t2); ro.disconnect(); window.removeEventListener("resize", measure) }
  }, [measure])

  /* Save on page unload */
  useEffect(() => {
    const flush = () => savePixelPositions(persistenceKey, widgetsRef.current)
    window.addEventListener("beforeunload", flush)
    return () => window.removeEventListener("beforeunload", flush)
  }, [persistenceKey])

  /* Initialize / merge: load saved pixel positions, then add any layout
     widgets not yet in the map (newly added widgets). */
  useEffect(() => {
    if (!mounted || width === 0) return
    const saved = loadPixelPositions(persistenceKey)
    const lg = layouts.lg ?? []
    const merged = new Map<string, LayoutPosition>()

    for (const item of lg) {
      const savedPos = saved?.get(item.i)
      if (savedPos) {
        merged.set(item.i, savedPos)
      } else {
        const colWidth = (width - margin[0] * (COLS - 1)) / COLS
        merged.set(item.i, {
          x: item.x * (colWidth + margin[0]),
          y: item.y * (rowHeight + margin[0]),
          width: item.w * colWidth + (item.w - 1) * margin[0],
          height: item.h * rowHeight + (item.h - 1) * margin[0],
        })
      }
    }
    setWidgets(merged)
  }, [mounted, width, layouts, persistenceKey, rowHeight, margin])

  /* ── Interaction using refs to avoid stale closures ── */

  /* Refs for props used in document-level handlers */
  const onLayoutChangeRef = useRef(onLayoutChange)
  onLayoutChangeRef.current = onLayoutChange
  const layoutsRef = useRef(layouts)
  layoutsRef.current = layouts
  const widthRef = useRef(width)
  widthRef.current = width
  const rowHeightRef = useRef(rowHeight)
  rowHeightRef.current = rowHeight
  const marginRef = useRef(margin[0])
  marginRef.current = margin[0]
  const persistenceKeyRef = useRef(persistenceKey)
  persistenceKeyRef.current = persistenceKey

  /* Drag state ref (no React state, just refs for perf) */
  const dragRef = useRef<{
    widgetId: string
    startX: number
    startY: number
    startPos: LayoutPosition
    isResize: boolean
    nearRight: boolean
    nearBottom: boolean
    nearLeft: boolean
    nearTop: boolean
  } | null>(null)

  /* Document-level pointermove / pointerup handler */
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d) return

      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY

      if (!d.isResize) {
        setDraggingWidget(d.widgetId)
        setWidgets(prev => {
          const cur = prev.get(d.widgetId)
          if (!cur) return prev
          const next = new Map(prev)
          next.set(d.widgetId, {
            ...cur,
            x: Math.max(0, d.startPos.x + dx),
            y: Math.max(0, d.startPos.y + dy),
          })
          return next
        })
      } else {
        setResizingWidget(d.widgetId)
        setWidgets(prev => {
          const cur = prev.get(d.widgetId)
          if (!cur) return prev
          let nx = d.startPos.x
          let ny = d.startPos.y
          let nw = d.startPos.width
          let nh = d.startPos.height

          if (d.nearRight) nw = Math.max(MIN_SIZE, d.startPos.width + dx)
          if (d.nearBottom) nh = Math.max(MIN_SIZE, d.startPos.height + dy)
          if (d.nearLeft) {
            const dw = -dx
            if (d.startPos.width + dw >= MIN_SIZE) {
              nw = d.startPos.width + dw
              nx = d.startPos.x - dw
            }
          }
          if (d.nearTop) {
            const dh = -dy
            if (d.startPos.height + dh >= MIN_SIZE) {
              nh = d.startPos.height + dh
              ny = d.startPos.y - dh
            }
          }

          const next = new Map(prev)
          next.set(d.widgetId, {
            x: Math.max(0, nx),
            y: Math.max(0, ny),
            width: nw,
            height: nh,
          })
          return next
        })
      }
    }

    const handlePointerUp = () => {
      const d = dragRef.current
      dragRef.current = null
      setDraggingWidget(null)
      setResizingWidget(null)

      if (!d) return

      savePixelPositions(persistenceKeyRef.current, widgetsRef.current)

      const w = widthRef.current
      if (w > 0) {
        const finalPos = widgetsRef.current.get(d.widgetId)
        if (finalPos) {
          const gi = pixelsToGrid(d.widgetId, finalPos, w, COLS, rowHeightRef.current, marginRef.current)[0]
          const lg = layoutsRef.current.lg ?? []
          const newLg = lg.map(item =>
            item.i === d.widgetId
              ? { ...item, x: gi.x, y: gi.y, w: gi.w, h: gi.h }
              : item
          )
          onLayoutChangeRef.current(newLg, { ...layoutsRef.current, lg: newLg })
        }
      }
    }

    document.addEventListener("pointermove", handlePointerMove)
    document.addEventListener("pointerup", handlePointerUp)
    return () => {
      document.removeEventListener("pointermove", handlePointerMove)
      document.removeEventListener("pointerup", handlePointerUp)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent, widgetId: string) => {
    e.preventDefault()
    e.stopPropagation()

    const startPos = widgetsRef.current.get(widgetId)
    if (!startPos) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top

    dragRef.current = {
      widgetId,
      startX: e.clientX,
      startY: e.clientY,
      startPos,
      isResize: false,
      nearRight: relX > rect.width - EDGE_THRESHOLD,
      nearBottom: relY > rect.height - EDGE_THRESHOLD,
      nearLeft: relX < EDGE_THRESHOLD,
      nearTop: relY < EDGE_THRESHOLD,
    }
    dragRef.current.isResize =
      dragRef.current.nearRight ||
      dragRef.current.nearBottom ||
      dragRef.current.nearLeft ||
      dragRef.current.nearTop
  }

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top

    const nl = relX < EDGE_THRESHOLD
    const nr = relX > rect.width - EDGE_THRESHOLD
    const nt = relY < EDGE_THRESHOLD
    const nb = relY > rect.height - EDGE_THRESHOLD

    let cursor = 'move'
    if ((nl && nt) || (nr && nb)) cursor = 'nwse-resize'
    else if ((nr && nt) || (nl && nb)) cursor = 'nesw-resize'
    else if (nr || nl) cursor = 'ew-resize'
    else if (nt || nb) cursor = 'ns-resize'

    const id = (e.currentTarget as HTMLElement).dataset.widgetId
    if (id && cursor !== cursors[id]) {
      setCursors(prev => ({ ...prev, [id]: cursor }))
    }
  }, [cursors])

  if (!mounted) return <div ref={containerRef} style={{ width: '100%', minHeight: 400 }} />

  const totalHeight = widgets.size > 0
    ? Math.max(...Array.from(widgets.values()).map(w => w.y + w.height)) + 100
    : 600

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 && (
        <div className="relative" style={{ height: totalHeight, overflow: 'hidden' }}>
          {Array.from(widgets.entries()).map(([id, pos]) => {
            const isDragging = draggingWidget === id
            const isResizing = resizingWidget === id
            return (
              <div
                key={id}
                data-widget-id={id}
                onPointerDown={(e) => handlePointerDown(e, id)}
                onPointerMove={handlePointerMove}
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: pos.width,
                  height: pos.height,
                  cursor: cursors[id] ?? 'move',
                  zIndex: isDragging || isResizing ? 100 : 1,
                  userSelect: 'none',
                  touchAction: 'none',
                  transition: isDragging || isResizing ? 'none' : 'box-shadow 0.15s',
                  boxShadow: isDragging || isResizing ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
                }}
              >
                {React.Children.map(children, (child) => {
                  if (React.isValidElement(child) && String(child.key) === id) {
                    return child
                  }
                  return null
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
