"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Responsive as ResponsiveGridLayout } from "react-grid-layout"
import type { Layouts, Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
const COLS        = { lg: 12,   md: 10,  sm: 6,   xs: 4,   xxs: 2 }

interface GridWrapperProps {
  layouts: Layouts
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void
  children: React.ReactNode
  rowHeight?: number
  margin?: [number, number]
  draggableHandle?: string
  onBreakpointChange?: (bp: string, cols: number) => void
}

export function GridWrapper({
  layouts,
  onLayoutChange,
  children,
  rowHeight = 72,
  margin = [12, 12],
  draggableHandle = ".widget-drag-bar",
  onBreakpointChange,
}: GridWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [mounted, setMounted] = useState(false)

  const measure = useCallback(() => {
    if (!containerRef.current) return
    const w = containerRef.current.getBoundingClientRect().width
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
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure])

  if (!mounted) return <div ref={containerRef} style={{ width: "100%", minHeight: 400 }} />

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {width > 0 && (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={rowHeight}
          margin={margin}
          compactType="vertical"
          isDraggable
          isResizable
          draggableHandle={draggableHandle}
          draggableCancel="button, input, textarea, select, a, [role='button'], .widget-no-drag"
          resizeHandles={["se", "sw", "ne", "nw", "e", "w", "s", "n"]}
          useCSSTransforms
          onLayoutChange={onLayoutChange}
          onBreakpointChange={onBreakpointChange}
        >
          {children}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
