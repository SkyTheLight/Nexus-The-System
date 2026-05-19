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
    if (raw) return new Map(Object.entries(JSON.parse(raw) as Record<string, LayoutPosition>))
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

function pixelsToGrid(id: string, pos: LayoutPosition, w: number, rh: number, mg: number): Layout {
  const cw = (w - mg * (COLS - 1)) / COLS
  return [{
    i: id,
    x: Math.max(0, Math.round(pos.x / (cw + mg))),
    y: Math.max(0, Math.round(pos.y / (rh + mg))),
    w: Math.max(1, Math.min(COLS, Math.round((pos.width + mg) / (cw + mg)))),
    h: Math.max(1, Math.round((pos.height + mg) / (rh + mg))),
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
  const [dragging, setDragging] = useState<string | null>(null)
  const [resizing, setResizing] = useState<string | null>(null)
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

  useEffect(() => {
    const flush = () => savePixelPositions(persistenceKey, widgetsRef.current)
    window.addEventListener("beforeunload", flush)
    return () => window.removeEventListener("beforeunload", flush)
  }, [persistenceKey])

  useEffect(() => {
    if (!mounted || width === 0) return
    const saved = loadPixelPositions(persistenceKey)
    const lg = layouts.lg ?? []
    const merged = new Map<string, LayoutPosition>()
    const cw = (width - margin[0] * (COLS - 1)) / COLS
    for (const item of lg) {
      const p = saved?.get(item.i)
      merged.set(item.i, p ?? {
        x: item.x * (cw + margin[0]),
        y: item.y * (rowHeight + margin[0]),
        width: item.w * cw + (item.w - 1) * margin[0],
        height: item.h * rowHeight + (item.h - 1) * margin[0],
      })
    }
    setWidgets(merged)
  }, [mounted, width, layouts, persistenceKey, rowHeight, margin])

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()

    const el = e.currentTarget as HTMLElement
    const startPos = widgetsRef.current.get(id)
    if (!startPos) return

    const rect = el.getBoundingClientRect()
    const rx = e.clientX - rect.left
    const ry = e.clientY - rect.top
    const nr = rx > rect.width - EDGE_THRESHOLD
    const nb = ry > rect.height - EDGE_THRESHOLD
    const nl = rx < EDGE_THRESHOLD
    const nt = ry < EDGE_THRESHOLD
    const isResize = nr || nb || nl || nt

    const startX = e.clientX
    const startY = e.clientY

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX
      const dy = me.clientY - startY

      if (!isResize) {
        setDragging(id)
        setWidgets(prev => {
          const cur = prev.get(id)
          if (!cur) return prev
          const next = new Map(prev)
          next.set(id, { ...cur, x: Math.max(0, startPos.x + dx), y: Math.max(0, startPos.y + dy) })
          return next
        })
      } else {
        setResizing(id)
        setWidgets(prev => {
          const cur = prev.get(id)
          if (!cur) return prev
          let nx = startPos.x, ny = startPos.y, nw = startPos.width, nh = startPos.height
          if (nr) nw = Math.max(MIN_SIZE, startPos.width + dx)
          if (nb) nh = Math.max(MIN_SIZE, startPos.height + dy)
          if (nl) { const dw = -dx; if (startPos.width + dw >= MIN_SIZE) { nw = startPos.width + dw; nx = startPos.x - dw } }
          if (nt) { const dh = -dy; if (startPos.height + dh >= MIN_SIZE) { nh = startPos.height + dh; ny = startPos.y - dh } }
          const next = new Map(prev)
          next.set(id, { x: Math.max(0, nx), y: Math.max(0, ny), width: nw, height: nh })
          return next
        })
      }
    }

    const onUp = () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      setDragging(null)
      setResizing(null)

      savePixelPositions(persistenceKey, widgetsRef.current)

      const final = widgetsRef.current.get(id)
      if (final && width > 0) {
        const gi = pixelsToGrid(id, final, width, rowHeight, margin[0])[0]
        const lg = layouts.lg ?? []
        onLayoutChange(
          lg.map(item => item.i === id ? { ...item, x: gi.x, y: gi.y, w: gi.w, h: gi.h } : item),
          { ...layouts, lg: lg.map(item => item.i === id ? { ...item, x: gi.x, y: gi.y, w: gi.w, h: gi.h } : item) }
        )
      }
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  if (!mounted) return <div ref={containerRef} style={{ width: '100%', minHeight: 400 }} />

  const totalHeight = widgets.size > 0
    ? Math.max(...Array.from(widgets.values()).map(w => w.y + w.height)) + 100
    : 600

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 && (
        <div className="relative" style={{ height: totalHeight, overflow: 'hidden' }}>
          {Array.from(widgets.entries()).map(([id, pos]) => {
            const isDrag = dragging === id
            const isResize = resizing === id
            return (
              <div
                key={id}
                onMouseDown={(e) => handleMouseDown(e, id)}
                className="absolute"
                style={{
                  left: pos.x, top: pos.y, width: pos.width, height: pos.height,
                  cursor: 'move', zIndex: isDrag || isResize ? 100 : 1,
                  userSelect: 'none', touchAction: 'none',
                }}
              >
                {React.Children.map(children, (child) => {
                  if (React.isValidElement(child) && String(child.key) === id) return child
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
