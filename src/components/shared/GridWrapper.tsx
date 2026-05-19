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

const EDGE = 15
const MIN = 100
const COLS = 12

function loadPos(key: string): Map<string, LayoutPosition> | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return new Map(Object.entries(JSON.parse(raw) as Record<string, LayoutPosition>))
  } catch {}
  return null
}

function savePos(key: string, m: Map<string, LayoutPosition>) {
  try {
    const obj: Record<string, LayoutPosition> = {}
    m.forEach((p, id) => { obj[id] = p })
    localStorage.setItem(key, JSON.stringify(obj))
  } catch {}
}

function toGrid(id: string, p: LayoutPosition, w: number, rh: number, mg: number): Layout {
  const cw = (w - mg * (COLS - 1)) / COLS
  return [{
    i: id, x: Math.max(0, Math.round(p.x / (cw + mg))),
    y: Math.max(0, Math.round(p.y / (rh + mg))),
    w: Math.max(1, Math.min(COLS, Math.round((p.width + mg) / (cw + mg)))),
    h: Math.max(1, Math.round((p.height + mg) / (rh + mg))),
  }]
}

class GridErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <div style={{ color: '#d7b36a', fontFamily: 'monospace', fontSize: 10, padding: 16, textAlign: 'center' }}>⚠ GRID ERROR</div>
    return this.props.children
  }
}

export function GridWrapper(props: GridWrapperProps) {
  return (
    <GridErrorBoundary>
      <GridWrapperInner {...props} />
    </GridErrorBoundary>
  )
}

function GridWrapperInner({
  layouts,
  onLayoutChange,
  children,
  rowHeight = 72,
  margin = [12, 12] as [number, number],
  persistenceKey = "adversity-grid-pixels-v1",
}: GridWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [width, setWidth] = useState(0)
  const [widgets, setWidgets] = useState<Map<string, LayoutPosition>>(new Map())
  const [actId, setActId] = useState<string | null>(null)
  const wRef = useRef(widgets)
  wRef.current = widgets

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
    const flush = () => savePos(persistenceKey, wRef.current)
    window.addEventListener("beforeunload", flush)
    return () => window.removeEventListener("beforeunload", flush)
  }, [persistenceKey])

  useEffect(() => {
    if (!mounted || width === 0) return
    const saved = loadPos(persistenceKey)
    const lg = layouts.lg ?? []
    const merged = new Map<string, LayoutPosition>()
    const cw = (width - margin[0] * (COLS - 1)) / COLS
    for (const item of lg) {
      const p = saved?.get(item.i)
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.width) && Number.isFinite(p.height)) {
        merged.set(item.i, p)
      } else {
        merged.set(item.i, {
          x: (item.x ?? 0) * (cw + margin[0]),
          y: (item.y ?? 0) * (rowHeight + margin[0]),
          width: (item.w ?? 3) * cw + ((item.w ?? 3) - 1) * margin[0],
          height: (item.h ?? 3) * rowHeight + ((item.h ?? 3) - 1) * margin[0],
        })
      }
    }
    savePos(persistenceKey, merged)
    setWidgets(merged)
  }, [mounted, width, layouts, persistenceKey, rowHeight, margin])

  const onDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()

    const el = e.currentTarget as HTMLElement
    const start = wRef.current.get(id)
    if (!start) return

    const rect = el.getBoundingClientRect()
    const rx = e.clientX - rect.left
    const ry = e.clientY - rect.top
    const nr = rx > rect.width - EDGE
    const nb = ry > rect.height - EDGE
    const nl = rx < EDGE
    const nt = ry < EDGE
    const resize = nr || nb || nl || nt

    const sx = e.clientX, sy = e.clientY

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - sx, dy = me.clientY - sy
      if (!resize) {
        setActId(id)
        setWidgets(prev => {
          const cur = prev.get(id)
          if (!cur) return prev
          const next = new Map(prev)
          next.set(id, { ...cur, x: Math.max(0, start.x + dx), y: Math.max(0, start.y + dy) })
          return next
        })
      } else {
        setActId(id)
        setWidgets(prev => {
          const cur = prev.get(id)
          if (!cur) return prev
          let nx = start.x, ny = start.y, nw = start.width, nh = start.height
          if (nr) nw = Math.max(MIN, start.width + dx)
          if (nb) nh = Math.max(MIN, start.height + dy)
          if (nl) { const dw = -dx; if (start.width + dw >= MIN) { nw = start.width + dw; nx = start.x - dw } }
          if (nt) { const dh = -dy; if (start.height + dh >= MIN) { nh = start.height + dh; ny = start.y - dh } }
          const next = new Map(prev)
          next.set(id, { x: Math.max(0, nx), y: Math.max(0, ny), width: nw, height: nh })
          return next
        })
      }
    }

    const onUp = () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      setActId(null)
      savePos(persistenceKey, wRef.current)
      const final = wRef.current.get(id)
      if (final && width > 0) {
        const gi = toGrid(id, final, width, rowHeight, margin[0])[0]
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

  const th = widgets.size > 0
    ? Math.max(...Array.from(widgets.values()).map(w => (w?.y ?? 0) + (w?.height ?? 0))) + 100
    : 600

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 && (
        <div className="relative" style={{ height: th, overflow: 'hidden' }}>
          {Array.from(widgets.entries()).map(([id, pos]) => {
            const active = actId === id
            return (
              <div
                key={id}
                onMouseDown={(e) => onDown(e, id)}
                className="absolute"
                style={{
                  left: pos.x, top: pos.y,
                  width: pos.width, height: pos.height,
                  cursor: 'move',
                  zIndex: active ? 100 : 1,
                  userSelect: 'none', touchAction: 'none',
                }}
              >
                {React.Children.map(children, (ch) => {
                  if (React.isValidElement(ch) && String(ch.key) === id) return ch
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
