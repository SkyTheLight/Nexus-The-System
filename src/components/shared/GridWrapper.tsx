"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import type { Layout, Layouts } from "react-grid-layout"

const COLS = 12

function loadPos(key: string): Map<string, { x: number; y: number; width: number; height: number }> | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return new Map(Object.entries(JSON.parse(raw)))
  } catch {}
  return null
}

export function GridWrapper({
  layouts,
  children,
  rowHeight = 72,
  margin = [12, 12] as [number, number],
  persistenceKey = "adversity-grid-pixels-v1",
}: {
  layouts: Layouts
  onLayoutChange?: (currentLayout: Layout[], allLayouts: Layouts) => void
  children: React.ReactNode
  rowHeight?: number
  margin?: [number, number]
  persistenceKey?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [width, setWidth] = useState(0)
  const [widgets, setWidgets] = useState<Map<string, { x: number; y: number; width: number; height: number }>>(new Map())

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

  useEffect(() => {
    if (!mounted || width === 0) return
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
    setWidgets(merged)
  }, [mounted, width, layouts, persistenceKey, rowHeight, margin])

  if (!mounted) return <div ref={containerRef} style={{ width: '100%', minHeight: 400 }} />

  const th = widgets.size > 0
    ? Math.max(...Array.from(widgets.values()).map(w => (w?.y ?? 0) + (w?.height ?? 0))) + 100
    : 600

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 && (
        <div className="relative" style={{ height: th, overflow: 'hidden' }}>
          {Array.from(widgets.entries()).map(([id, pos]) => (
            <div
              key={id}
              className="absolute"
              style={{
                left: pos.x, top: pos.y,
                width: pos.width, height: pos.height,
                cursor: 'move', zIndex: 1,
                userSelect: 'none', touchAction: 'none',
              }}
            >
              {React.Children.map(children, (ch) => {
                if (React.isValidElement(ch) && String(ch.key) === id) return ch
                return null
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
