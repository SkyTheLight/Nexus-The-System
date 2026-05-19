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
  const widgetsRef = useRef<Map<string, LayoutPosition>>(new Map())
  const [mounted, setMounted] = useState(false)
  const [width, setWidth] = useState(0)
  const [widgets, setWidgets] = useState<Map<string, LayoutPosition>>(new Map())
  const [activeWidget, setActiveWidget] = useState<string | null>(null)
  const cursorsRef = useRef<Record<string, string>>({})
  const [_, forceRender] = useState(0)

  const rerender = useCallback(() => forceRender(n => n + 1), [])

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

  /* Initialize / merge widget positions */
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
    widgetsRef.current = merged
    setWidgets(merged)
  }, [mounted, width, layouts, persistenceKey, rowHeight, margin])

  /* ── Native drag interaction ── */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let dragId: string | null = null
    let dragStartX = 0
    let dragStartY = 0
    let dragStartPos: LayoutPosition | null = null
    let dragIsResize = false
    let dragNR = false
    let dragNB = false
    let dragNL = false
    let dragNT = false

    const onPointerDown = (e: PointerEvent) => {
      const el = (e.currentTarget as HTMLElement)
      const wid = el.dataset.widgetId
      if (!wid) return

      const pos = widgetsRef.current.get(wid)
      if (!pos) return

      const rect = el.getBoundingClientRect()
      const rx = e.clientX - rect.left
      const ry = e.clientY - rect.top

      const nr = rx > rect.width - EDGE_THRESHOLD
      const nb = ry > rect.height - EDGE_THRESHOLD
      const nl = rx < EDGE_THRESHOLD
      const nt = ry < EDGE_THRESHOLD
      const resize = nr || nb || nl || nt

      if (!resize) el.setPointerCapture(e.pointerId)
      e.preventDefault()

      dragId = wid
      dragStartX = e.clientX
      dragStartY = e.clientY
      dragStartPos = { ...pos }
      dragIsResize = resize
      dragNR = nr
      dragNB = nb
      dragNL = nl
      dragNT = nt

      el.style.zIndex = '100'
      el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'
      el.style.transition = 'none'
      setActiveWidget(wid)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragId || !dragStartPos) return

      const dx = e.clientX - dragStartX
      const dy = e.clientY - dragStartY

      const el = container.querySelector(`[data-widget-id="${dragId}"]`) as HTMLElement | null
      if (!el) return

      if (!dragIsResize) {
        el.style.left = `${Math.max(0, dragStartPos.x + dx)}px`
        el.style.top = `${Math.max(0, dragStartPos.y + dy)}px`
      } else {
        let nx = dragStartPos.x
        let ny = dragStartPos.y
        let nw = dragStartPos.width
        let nh = dragStartPos.height

        if (dragNR) nw = Math.max(MIN_SIZE, dragStartPos.width + dx)
        if (dragNB) nh = Math.max(MIN_SIZE, dragStartPos.height + dy)
        if (dragNL) {
          const dw = -dx
          if (dragStartPos.width + dw >= MIN_SIZE) {
            nw = dragStartPos.width + dw
            nx = dragStartPos.x - dw
          }
        }
        if (dragNT) {
          const dh = -dy
          if (dragStartPos.height + dh >= MIN_SIZE) {
            nh = dragStartPos.height + dh
            ny = dragStartPos.y - dh
          }
        }

        el.style.left = `${Math.max(0, nx)}px`
        el.style.top = `${Math.max(0, ny)}px`
        el.style.width = `${nw}px`
        el.style.height = `${nh}px`
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!dragId || !dragStartPos) {
        dragId = null
        return
      }

      const el = container.querySelector(`[data-widget-id="${dragId}"]`) as HTMLElement | null

      /* Read final position from DOM */
      let finalLeft = dragStartPos.x
      let finalTop = dragStartPos.y
      let finalWidth = dragStartPos.width
      let finalHeight = dragStartPos.height

      if (el) {
        const leftStr = el.style.left
        const topStr = el.style.top
        const widthStr = el.style.width
        const heightStr = el.style.height
        if (leftStr) finalLeft = parseFloat(leftStr)
        if (topStr) finalTop = parseFloat(topStr)
        if (widthStr) finalWidth = parseFloat(widthStr)
        if (heightStr) finalHeight = parseFloat(heightStr)

        el.style.zIndex = '1'
        el.style.boxShadow = 'none'
        el.style.transition = 'box-shadow 0.15s'

        /* Release pointer capture if any */
        try { el.releasePointerCapture(e.pointerId) } catch {}
      }

      const finalPos: LayoutPosition = {
        x: finalLeft,
        y: finalTop,
        width: finalWidth,
        height: finalHeight,
      }

      /* Update React state */
      widgetsRef.current.set(dragId, finalPos)
      setWidgets(new Map(widgetsRef.current))
      setActiveWidget(null)

      /* Persist */
      savePixelPositions(persistenceKey, widgetsRef.current)

      /* Notify parent */
      const w = width
      if (w > 0) {
        const gi = pixelsToGrid(dragId, finalPos, w, COLS, rowHeight, margin[0])[0]
        const lg = layouts.lg ?? []
        const newLg = lg.map(item =>
          item.i === dragId
            ? { ...item, x: gi.x, y: gi.y, w: gi.w, h: gi.h }
            : item
        )
        onLayoutChange(newLg, { ...layouts, lg: newLg })
      }

      dragId = null
      dragStartPos = null
    }

    /* Cursor tracking */
    const onPointerMoveCursor = (e: PointerEvent) => {
      const el = (e.currentTarget as HTMLElement)
      const wid = el.dataset.widgetId
      if (!wid) return
      if (dragId) return

      const rect = el.getBoundingClientRect()
      const rx = e.clientX - rect.left
      const ry = e.clientY - rect.top

      const nl = rx < EDGE_THRESHOLD
      const nr = rx > rect.width - EDGE_THRESHOLD
      const nt = ry < EDGE_THRESHOLD
      const nb = ry > rect.height - EDGE_THRESHOLD

      let cursor = 'move'
      if ((nl && nt) || (nr && nb)) cursor = 'nwse-resize'
      else if ((nr && nt) || (nl && nb)) cursor = 'nesw-resize'
      else if (nr || nl) cursor = 'ew-resize'
      else if (nt || nb) cursor = 'ns-resize'

      if (el.style.cursor !== cursor) el.style.cursor = cursor
    }

    /* Attach native pointerdown to each widget */
    const widgets = container.querySelectorAll<HTMLElement>('[data-widget-id]')
    widgets.forEach(el => {
      el.addEventListener('pointerdown', onPointerDown)
      el.addEventListener('pointermove', onPointerMoveCursor)
    })

    /* Document-level move/up */
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)

    return () => {
      widgets.forEach(el => {
        el.removeEventListener('pointerdown', onPointerDown)
        el.removeEventListener('pointermove', onPointerMoveCursor)
      })
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }
  })

  /* ── Render ── */

  if (!mounted) return <div ref={containerRef} style={{ width: '100%', minHeight: 400 }} />

  const totalHeight = widgets.size > 0
    ? Math.max(...Array.from(widgets.values()).map(w => w.y + w.height)) + 100
    : 600

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 && (
        <div className="relative" style={{ height: totalHeight, overflow: 'hidden' }}>
          {Array.from(widgets.entries()).map(([id, pos]) => {
            const isActive = activeWidget === id
            return (
              <div
                key={id}
                data-widget-id={id}
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: pos.width,
                  height: pos.height,
                  cursor: 'move',
                  zIndex: isActive ? 100 : 1,
                  userSelect: 'none',
                  touchAction: 'none',
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
