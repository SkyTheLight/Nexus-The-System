"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import type { Layout, Layouts } from "react-grid-layout"

const HANDLE = 10
const COLS = 12
const MIN_COLS = 2
const MIN_ROWS = 2

function loadPos(key: string): Map<string, { x: number; y: number; width: number; height: number }> | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return new Map(Object.entries(JSON.parse(raw)))
  } catch {}
  return null
}

function savePos(key: string, m: Map<string, { x: number; y: number; width: number; height: number }>) {
  try {
    const obj: Record<string, { x: number; y: number; width: number; height: number }> = {}
    m.forEach((p, id) => { obj[id] = p })
    localStorage.setItem(key, JSON.stringify(obj))
  } catch {}
}

function toGrid(id: string, p: { x: number; y: number; width: number; height: number }, w: number, rh: number, mg: number): Layout {
  const cw = (w - mg * (COLS - 1)) / COLS
  return {
    i: id,
    x: Math.max(0, Math.round(p.x / (cw + mg))),
    y: Math.max(0, Math.round(p.y / (rh + mg))),
    w: Math.max(1, Math.min(COLS, Math.round((p.width + mg) / (cw + mg)))),
    h: Math.max(1, Math.round((p.height + mg) / (rh + mg))),
  }
}

function snapToGrid(px: number, cell: number, mg: number): number {
  const step = cell + mg
  return Math.round(px / step) * step
}

function posEqual(a: Map<string, { x: number; y: number; width: number; height: number }>, b: Map<string, { x: number; y: number; width: number; height: number }>): boolean {
  if (a.size !== b.size) return false
  for (const [id, pa] of a) {
    const pb = b.get(id)
    if (!pb) return false
    if (pa.x !== pb.x || pa.y !== pb.y || pa.width !== pb.width || pa.height !== pb.height) return false
  }
  return true
}

const handleStyle = {
  position: 'absolute' as const,
  width: HANDLE,
  height: HANDLE,
  background: 'rgba(168,85,247,0.5)',
  border: '1px solid rgba(168,85,247,0.8)',
  zIndex: 10,
  borderRadius: 1,
}

const handles = [
  { key: 'tl', style: { top: -HANDLE/2, left: -HANDLE/2, cursor: 'nwse-resize' } },
  { key: 'tr', style: { top: -HANDLE/2, right: -HANDLE/2, cursor: 'nesw-resize' } },
  { key: 'bl', style: { bottom: -HANDLE/2, left: -HANDLE/2, cursor: 'nesw-resize' } },
  { key: 'br', style: { bottom: -HANDLE/2, right: -HANDLE/2, cursor: 'nwse-resize' } },
  { key: 'tm', style: { top: -HANDLE/2, left: '50%', marginLeft: -HANDLE/2, cursor: 'ns-resize' } },
  { key: 'bm', style: { bottom: -HANDLE/2, left: '50%', marginLeft: -HANDLE/2, cursor: 'ns-resize' } },
  { key: 'ml', style: { left: -HANDLE/2, top: '50%', marginTop: -HANDLE/2, cursor: 'ew-resize' } },
  { key: 'mr', style: { right: -HANDLE/2, top: '50%', marginTop: -HANDLE/2, cursor: 'ew-resize' } },
]

export function GridWrapper({
  layouts,
  onLayoutChange,
  adjustable = false,
  children,
  rowHeight = 72,
  margin = [12, 12] as [number, number],
  persistenceKey = "adversity-grid-pixels-v1",
}: {
  layouts: Layouts
  onLayoutChange?: (currentLayout: Layout[], allLayouts: Layouts) => void
  adjustable?: boolean
  children: React.ReactNode
  rowHeight?: number
  margin?: [number, number]
  persistenceKey?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [width, setWidth] = useState(0)
  const [widgets, setWidgets] = useState<Map<string, { x: number; y: number; width: number; height: number }>>(new Map())
  const [actId, setActId] = useState<string | null>(null)
  const [gridSize, setGridSize] = useState<{ w: number; h: number } | null>(null)
  const wRef = useRef(widgets)
  wRef.current = widgets

  const prevKeyRef = useRef("")
  const layoutKey = JSON.stringify(layouts.lg?.map(i => ({ i: i.i, x: i.x, y: i.y, w: i.w, h: i.h })))

  const measure = useCallback(() => {
    const w = containerRef.current?.getBoundingClientRect().width ?? 0
    if (w > 0) setWidth(w)
  }, [])

  useEffect(() => {
    setMounted(true)
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [measure])

  const [flushReady, setFlushReady] = useState(false)
  useEffect(() => { setFlushReady(true) }, [])

  useEffect(() => {
    if (!flushReady) return
    const flush = () => savePos(persistenceKey, wRef.current)
    window.addEventListener("beforeunload", flush)
    return () => window.removeEventListener("beforeunload", flush)
  }, [persistenceKey, flushReady])

  useEffect(() => {
    if (!mounted || width === 0) return
    if (layoutKey === prevKeyRef.current) return
    prevKeyRef.current = layoutKey

    const saved = loadPos(persistenceKey)
    const lg = layouts.lg ?? []
    const merged = new Map<string, { x: number; y: number; width: number; height: number }>()
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

    if (!posEqual(merged, wRef.current)) {
      setWidgets(merged)
    }
  }, [mounted, width, layoutKey, persistenceKey, rowHeight, margin])

  /* ── Drag / Resize with grid snapping ── */
  const onDown = useCallback((e: React.MouseEvent, id: string) => {
    if (!adjustable || !onLayoutChange) return
    e.preventDefault()
    e.stopPropagation()

    const start = wRef.current.get(id)
    if (!start) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const rx = e.clientX - rect.left
    const ry = e.clientY - rect.top

    const cw = width > 0 ? (width - margin[0] * (COLS - 1)) / COLS : 100
    const cellW = cw + margin[0]
    const cellH = rowHeight + margin[0]

    let dragMode: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | 'resize-t' | 'resize-b' | 'resize-l' | 'resize-r' = 'move'
    if (ry < HANDLE && rx < HANDLE) dragMode = 'resize-tl'
    else if (ry < HANDLE && rx > rect.width - HANDLE) dragMode = 'resize-tr'
    else if (ry > rect.height - HANDLE && rx < HANDLE) dragMode = 'resize-bl'
    else if (ry > rect.height - HANDLE && rx > rect.width - HANDLE) dragMode = 'resize-br'
    else if (ry < HANDLE) dragMode = 'resize-t'
    else if (ry > rect.height - HANDLE) dragMode = 'resize-b'
    else if (rx < HANDLE) dragMode = 'resize-l'
    else if (rx > rect.width - HANDLE) dragMode = 'resize-r'

    const sx = e.clientX
    const sy = e.clientY
    const isResize = dragMode !== 'move'

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - sx
      const dy = me.clientY - sy
      setActId(id)
      setWidgets(prev => {
        const cur = prev.get(id)
        if (!cur) return prev
        let nx = start.x, ny = start.y, nw = start.width, nh = start.height

        if (!isResize) {
          nx = Math.max(0, start.x + dx)
          ny = Math.max(0, start.y + dy)
        } else {
          const minPxW = MIN_COLS * cw + (MIN_COLS - 1) * margin[0]
          const minPxH = MIN_ROWS * rowHeight + (MIN_ROWS - 1) * margin[0]

          if (dragMode.includes('r')) {
            const raw = start.width + dx
            const snapped = snapToGrid(start.x + raw, cw, margin[0]) - snapToGrid(start.x, cw, margin[0])
            nw = Math.max(minPxW, snapped)
          }
          if (dragMode.includes('l')) {
            const right = start.x + start.width
            const rawW = start.width - dx
            const snapped = snapToGrid(right, cw, margin[0]) - snapToGrid(right - rawW, cw, margin[0])
            nw = Math.max(minPxW, snapped)
            nx = right - nw
          }
          if (dragMode.includes('b')) {
            const raw = start.height + dy
            const snapped = snapToGrid(start.y + raw, rowHeight, margin[0]) - snapToGrid(start.y, rowHeight, margin[0])
            nh = Math.max(minPxH, snapped)
          }
          if (dragMode.includes('t')) {
            const bottom = start.y + start.height
            const rawH = start.height - dy
            const snapped = snapToGrid(bottom, rowHeight, margin[0]) - snapToGrid(bottom - rawH, rowHeight, margin[0])
            nh = Math.max(minPxH, snapped)
            ny = bottom - nh
          }
        }

        const next = new Map(prev)
        next.set(id, { x: Math.max(0, nx), y: Math.max(0, ny), width: nw, height: nh })
        return next
      })

      if (isResize) {
        const cur = wRef.current.get(id)
        if (cur) {
          const gw = Math.max(MIN_COLS, Math.min(COLS, Math.round((cur.width + margin[0]) / cellW)))
          const gh = Math.max(MIN_ROWS, Math.round((cur.height + margin[0]) / cellH))
          setGridSize({ w: gw, h: gh })
        }
      } else {
        setGridSize(null)
      }
    }

    const onUp = () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      setActId(null)
      setGridSize(null)
      savePos(persistenceKey, wRef.current)

      const final = wRef.current.get(id)
      if (final && width > 0 && onLayoutChange) {
        const gi = toGrid(id, final, width, rowHeight, margin[0])
        const lg = layouts.lg ?? []
        onLayoutChange(
          lg.map(item => item.i === id ? { ...item, x: gi.x, y: gi.y, w: gi.w, h: gi.h } : item),
          { ...layouts, lg: lg.map(item => item.i === id ? { ...item, x: gi.x, y: gi.y, w: gi.w, h: gi.h } : item) }
        )
      }
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }, [onLayoutChange, width, rowHeight, margin, persistenceKey, layouts])

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
                  cursor: adjustable ? 'move' : 'default',
                  zIndex: active ? 100 : 1,
                  userSelect: 'none', touchAction: 'none',
                }}
              >
                {/* Resize handles (visible only in adjustment mode on hover) */}
                {adjustable && handles.map(h => (
                  <div
                    key={h.key}
                    className="resize-handle"
                    style={{ ...handleStyle, ...h.style, opacity: 0 }}
                  />
                ))}

                {/* Active dimension label */}
                {active && gridSize && (
                  <div
                    className="absolute top-1 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 bg-[#a855f7] text-[10px] font-mono text-black font-bold rounded pointer-events-none"
                  >
                    {gridSize.w}&times;{gridSize.h}
                  </div>
                )}

                {React.Children.map(children, (ch) => {
                  if (React.isValidElement(ch) && String(ch.key) === id) return ch
                  return null
                })}
              </div>
            )
          })}
        </div>
      )}
      <style>{`
        .absolute:hover > .resize-handle { opacity: 1 !important; }
      `}</style>
      {adjustable && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-[#a855f7] text-[10px] font-mono text-black font-bold rounded pointer-events-none uppercase tracking-wider">
          ADJUSTMENT MODE
        </div>
      )}
    </div>
  )
}
