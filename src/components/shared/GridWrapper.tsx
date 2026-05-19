"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { GridLayout, type Layouts, type Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

interface GridWrapperProps {
  layouts: Layouts
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void
  children: React.ReactNode
  rowHeight?: number
  margin?: [number, number]
  draggableHandle?: string
}

const breakpoints = [
  { key: "lg", minWidth: 1200, cols: 12 },
  { key: "md", minWidth: 996, cols: 10 },
  { key: "sm", minWidth: 768, cols: 6 },
  { key: "xs", minWidth: 480, cols: 4 },
  { key: "xxs", minWidth: 0, cols: 2 },
]

function getBreakpoint(w: number): string {
  for (const bp of breakpoints) {
    if (w >= bp.minWidth) return bp.key
  }
  return "xxs"
}

function getCols(w: number): number {
  for (const bp of breakpoints) {
    if (w >= bp.minWidth) return bp.cols
  }
  return 2
}

export function GridWrapper({
  layouts,
  onLayoutChange,
  children,
  rowHeight = 72,
  margin = [12, 12],
  draggableHandle = ".widget-drag-bar",
}: GridWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  const measure = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.getBoundingClientRect().width
      if (w > 0) setWidth(w)
    }
  }, [])

  useEffect(() => {
    measure()
    const t1 = setTimeout(measure, 50)
    const t2 = setTimeout(measure, 200)
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

  const currentLayout = useMemo(() => {
    if (width === 0) return []
    const bp = getBreakpoint(width)
    return layouts[bp] || layouts.lg || []
  }, [layouts, width])

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      if (width === 0) return
      const bp = getBreakpoint(width)
      const updated = { ...layouts, [bp]: newLayout }
      onLayoutChange(newLayout, updated)
    },
    [layouts, width, onLayoutChange]
  )

  if (width === 0 || currentLayout.length === 0) {
    return <div ref={containerRef} style={{ width: "100%", minHeight: "400px" }} />
  }

  return (
    <div ref={containerRef} style={{ width: "100%", minHeight: "400px" }}>
      <GridLayout
        width={width}
        layout={currentLayout}
        cols={getCols(width)}
        rowHeight={rowHeight}
        margin={margin}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        draggableHandle={draggableHandle}
        compactType={null}
      >
        {children}
      </GridLayout>
    </div>
  )
}
