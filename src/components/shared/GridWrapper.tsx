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

  /* Initialize / merge: load saved pixel positions, then overlay any layout
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

  /* ── Interaction ── */
  const handleWidgetMouseDown = (e: React.MouseEvent, widgetId: string) => {
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const startPos = widgets.get(widgetId)
    if (!startPos) return

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top

    const isNearRight = relX > rect.width - EDGE_THRESHOLD
    const isNearBottom = relY > rect.height - EDGE_THRESHOLD
    const isNearLeft = relX < EDGE_THRESHOLD
    const isNearTop = relY < EDGE_THRESHOLD

    const isResize = isNearRight || isNearBottom || isNearLeft || isNearTop

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      if (!isResize) {
        setDraggingWidget(widgetId)
        const newLayout = new Map(widgets)
        const currentWidget = newLayout.get(widgetId)
        if (currentWidget) {
          newLayout.set(widgetId, {
            ...currentWidget,
            x: Math.max(0, startPos.x + deltaX),
            y: Math.max(0, startPos.y + deltaY),
          })
          setWidgets(newLayout)
        }
      } else {
        setResizingWidget(widgetId)
        const newLayout = new Map(widgets)
        const currentWidget = newLayout.get(widgetId)
        if (currentWidget) {
          let newX = currentWidget.x
          let newY = currentWidget.y
          let newWidth = currentWidget.width
          let newHeight = currentWidget.height

          if (isNearRight) newWidth = Math.max(MIN_SIZE, currentWidget.width + deltaX)
          if (isNearBottom) newHeight = Math.max(MIN_SIZE, currentWidget.height + deltaY)
          if (isNearLeft) {
            const deltaW = -deltaX
            if (currentWidget.width + deltaW >= MIN_SIZE) {
              newWidth = currentWidget.width + deltaW
              newX = currentWidget.x - deltaW
            }
          }
          if (isNearTop) {
            const deltaH = -deltaY
            if (currentWidget.height + deltaH >= MIN_SIZE) {
              newHeight = currentWidget.height + deltaH
              newY = currentWidget.y - deltaH
            }
          }

          newLayout.set(widgetId, {
            x: Math.max(0, newX),
            y: Math.max(0, newY),
            width: newWidth,
            height: newHeight,
          })
          setWidgets(newLayout)
        }
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setDraggingWidget(null)
      setResizingWidget(null)

      savePixelPositions(persistenceKey, widgetsRef.current)

      if (width > 0) {
        const finalPos = widgetsRef.current.get(widgetId)
        if (finalPos) {
          const gridItem = pixelsToGrid(widgetId, finalPos, width, COLS, rowHeight, margin[0])[0]
          const lg = layouts.lg ?? []
          const newLg = lg.map(item =>
            item.i === widgetId
              ? { ...item, x: gridItem.x, y: gridItem.y, w: gridItem.w, h: gridItem.h }
              : item
          )
          onLayoutChange(newLg, { ...layouts, lg: newLg })
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { once: true })
  }

  const renderWidget = (id: string, pos: LayoutPosition) => {
    const isDragging = draggingWidget === id
    const isResizing = resizingWidget === id

    return (
      <div
        key={id}
        onMouseDown={(e) => handleWidgetMouseDown(e, id)}
        onMouseMove={(e) => {
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

          if (cursor !== cursors[id]) setCursors(prev => ({ ...prev, [id]: cursor }))
        }}
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
  }

  if (!mounted) return <div ref={containerRef} style={{ width: '100%', minHeight: 400 }} />

  const totalHeight = widgets.size > 0
    ? Math.max(...Array.from(widgets.values()).map(w => w.y + w.height)) + 100
    : 600

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 && (
        <div
          className="relative"
          style={{ height: totalHeight, overflow: 'hidden' }}
        >
          {Array.from(widgets.entries()).map(([id, pos]) => renderWidget(id, pos))}
        </div>
      )}
    </div>
  )
}
