"use client"

import { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from "react"

export interface WidgetPixelPos {
  x: number; y: number; w: number; h: number
}

export interface CustomGridHandle {
  getPositions: () => Record<string, WidgetPixelPos>
}

interface CustomGridProps {
  positions: Record<string, WidgetPixelPos>
  onPositionChange?: (id: string, pos: WidgetPixelPos) => void
  onBatchChange?: (positions: Record<string, WidgetPixelPos>) => void
  onDragEnd?: (id: string, pos: WidgetPixelPos) => void
  onResizeEnd?: (id: string, pos: WidgetPixelPos) => void
  children: React.ReactNode
  className?: string
}

const EDGE_THRESHOLD = 15
const MIN_SIZE = 80

export const CustomGrid = forwardRef<CustomGridHandle, CustomGridProps>(function CustomGrid({
  positions,
  onPositionChange,
  onBatchChange,
  onDragEnd,
  onResizeEnd,
  children,
  className = "",
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(positions)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<"drag" | "resize" | null>(null)
  posRef.current = positions

  useImperativeHandle(ref, () => ({
    getPositions: () => ({ ...posRef.current }),
  }))

  /* ── Cursor tracking per widget ── */
  const [cursors, setCursors] = useState<Record<string, string>>({})

  const updateCursor = useCallback((id: string, cursor: string) => {
    setCursors(prev => (prev[id] === cursor ? prev : { ...prev, [id]: cursor }))
  }, [])

  /* ── Drag / Resize ── */
  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return
    e.preventDefault()

    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const pos = posRef.current[id]
    if (!pos) return

    const relX = e.clientX - containerRect.left - pos.x
    const relY = e.clientY - containerRect.top - pos.y

    const nearLeft = relX < EDGE_THRESHOLD
    const nearRight = relX > pos.w - EDGE_THRESHOLD
    const nearTop = relY < EDGE_THRESHOLD
    const nearBottom = relY > pos.h - EDGE_THRESHOLD
    const isResize = nearLeft || nearRight || nearTop || nearBottom

    setActiveId(id)
    setActiveMode(isResize ? "resize" : "drag")

    const startX = e.clientX
    const startY = e.clientY
    const startPos = { ...pos }

    const handleMouseMove = (me: MouseEvent) => {
      const dx = me.clientX - startX
      const dy = me.clientY - startY

      if (isResize) {
        const next: WidgetPixelPos = { ...startPos }
        if (nearRight)  next.w = Math.max(MIN_SIZE, startPos.w + dx)
        if (nearBottom) next.h = Math.max(MIN_SIZE, startPos.h + dy)
        if (nearLeft) {
          const newW = Math.max(MIN_SIZE, startPos.w - dx)
          next.w = newW
          next.x = startPos.x + (startPos.w - newW)
        }
        if (nearTop) {
          const newH = Math.max(MIN_SIZE, startPos.h - dy)
          next.h = newH
          next.y = startPos.y + (startPos.h - newH)
        }
        onPositionChange?.(id, next)
      } else {
        const next: WidgetPixelPos = {
          x: Math.max(0, startPos.x + dx),
          y: Math.max(0, startPos.y + dy),
          w: startPos.w,
          h: startPos.h,
        }
        onPositionChange?.(id, next)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      const finalPos = posRef.current[id]
      setActiveId(null)
      setActiveMode(null)
      if (isResize) onResizeEnd?.(id, finalPos)
      else onDragEnd?.(id, finalPos)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp, { once: true })
  }, [onPositionChange, onDragEnd, onResizeEnd])

  /* ── Compute total height ── */
  const totalHeight = Object.values(positions).reduce(
    (max, p) => Math.max(max, p.y + p.h + 50),
    600
  )

  /* ── Get container top offset for cursor calc ── */
  const getContainerTop = useCallback(() => {
    return containerRef.current?.getBoundingClientRect().top ?? 0
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height: totalHeight }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        const id = String(child.key ?? "")
        const pos = positions[id]
        if (!pos) return null

        const isActive = activeId === id
        const cursor = cursors[id] ?? "grab"

        return (
          <div
            key={id}
            onMouseDown={(e) => handleMouseDown(e, id)}
            onMouseMove={(e) => {
              const cr = containerRef.current?.getBoundingClientRect()
              if (!cr || isActive) return
              const rx = e.clientX - cr.left - pos.x
              const ry = e.clientY - cr.top - pos.y
              const nl = rx < EDGE_THRESHOLD
              const nr = rx > pos.w - EDGE_THRESHOLD
              const nt = ry < EDGE_THRESHOLD
              const nb = ry > pos.h - EDGE_THRESHOLD
              let c = "grab"
              if ((nl && nt) || (nr && nb)) c = "nwse-resize"
              else if ((nr && nt) || (nl && nb)) c = "nesw-resize"
              else if (nr || nl) c = "ew-resize"
              else if (nt || nb) c = "ns-resize"
              if (c !== cursors[id]) updateCursor(id, c)
            }}
            onMouseLeave={() => { if (!isActive) updateCursor(id, "grab") }}
            className="absolute"
            style={{
              left: pos.x,
              top: pos.y,
              width: pos.w,
              height: pos.h,
              cursor,
              zIndex: isActive ? 100 : 1,
              userSelect: "none",
              touchAction: "none",
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
})
