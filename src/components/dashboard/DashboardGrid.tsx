'use client'

import { useMemo } from 'react'
import { GridWrapper } from '@/components/shared/GridWrapper'
import { useGridLayout } from '@/hooks/useGridLayout'
import WidgetShell from './WidgetShell'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'
import { HUB_DEFAULT_LAYOUTS, HUB_GRID, layoutsForVisible } from '@/lib/layout'

interface DashboardGridProps {
  visibleWidgetIds: string[]
  onHide:   (id: string) => void
  onDelete: (id: string) => void
}

export default function DashboardGrid({ visibleWidgetIds, onHide, onDelete }: DashboardGridProps) {
  const { layouts, handleLayoutChange, loaded } = useGridLayout({
    page: 'hub',
    defaultLayouts: HUB_DEFAULT_LAYOUTS,
  })

  const registryById = useMemo(() => new Map(WIDGET_REGISTRY.map(w => [w.id, w])), [])

  const displayLayouts = useMemo(
    () => layoutsForVisible(layouts, visibleWidgetIds),
    [layouts, visibleWidgetIds]
  )

  if (!loaded) return (
    <div className="text-[var(--sl-text-muted)] font-mono text-xs tracking-widest py-8 text-center uppercase">
      ◈ Initializing System...
    </div>
  )

  return (
    <GridWrapper
      layouts={displayLayouts}
      onLayoutChange={handleLayoutChange}
      rowHeight={HUB_GRID.rowHeight}
      margin={[...HUB_GRID.margin]}
      draggableHandle=".widget-drag-bar"
    >
      {visibleWidgetIds.map(id => {
        const entry = registryById.get(id)
        if (!entry) return null
        const Component = entry.component
        return (
          <div key={id} className="widget-shell-group">
            <WidgetShell id={id} label={entry.label} onHide={() => onHide(id)} onDelete={() => onDelete(id)}>
              <Component />
            </WidgetShell>
          </div>
        )
      })}
    </GridWrapper>
  )
}
