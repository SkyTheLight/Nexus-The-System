'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import WidgetShell from './WidgetShell'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'
import { GRID_GAP, ROW_HEIGHT } from '@/lib/gridUtils'

interface DashboardGridProps {
  layout: { i: string; x: number; y: number; w: number; h: number; minW?: number; minH?: number; maxW?: number }[]
  onLayoutChange: (layout: any[]) => void
  onHide: (id: string) => void
  onDelete: (id: string) => void
}

export default function DashboardGrid({ layout, onLayoutChange, onHide, onDelete }: DashboardGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gridWidth, setGridWidth] = useState(700)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setGridWidth(entries[0].contentRect.width)
    })
    ro.observe(el)
    const { width } = el.getBoundingClientRect()
    if (width > 0) setGridWidth(width)
    return () => ro.disconnect()
  }, [])

  const registryById = useMemo(() => new Map(WIDGET_REGISTRY.map(w => [w.id, w])), [])

  return (
    <div ref={containerRef} className="w-full">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={ROW_HEIGHT}
        width={gridWidth}
        gap={[GRID_GAP, GRID_GAP]}
        onLayoutChange={onLayoutChange}
        draggableHandle=".widget-drag-handle"
        resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
        compactType="vertical"
        isResizable={true}
        isDraggable={true}
        useCSSTransforms={true}
      >
        {layout.map(item => {
          const entry = registryById.get(item.i)
          if (!entry) return null
          const Component = entry.component
          return (
            <div key={item.i} className="widget-shell-group">
              <WidgetShell
                id={item.i}
                label={entry.label}
                onHide={() => onHide(item.i)}
                onDelete={() => onDelete(item.i)}
              >
                <Component />
              </WidgetShell>
            </div>
          )
        })}
      </GridLayout>
    </div>
  )
}
