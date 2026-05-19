'use client'

import { useMemo } from 'react'
import { GridWrapper } from '@/components/shared/GridWrapper'
import { useGridLayout } from '@/hooks/useGridLayout'
import WidgetShell from './WidgetShell'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'
import { HUB_DEFAULT_LAYOUTS, HUB_GRID, layoutsForVisible } from '@/lib/layout'
import { Check } from 'lucide-react'

interface DashboardGridProps {
  visibleWidgetIds: string[]
  onHide:   (id: string) => void
  onDelete: (id: string) => void
  switchMode?: boolean
  selectedId?: string | null
  onWidgetClick?: (id: string) => void
}

export default function DashboardGrid({ visibleWidgetIds, onHide, onDelete, switchMode, selectedId, onWidgetClick }: DashboardGridProps) {
  const { layouts, handleLayoutChange, loaded } = useGridLayout({
    page: 'hub',
    defaultLayouts: HUB_DEFAULT_LAYOUTS,
  })

  const registryById = useMemo(
    () => new Map(WIDGET_REGISTRY.map(w => [w.id, w])),
    []
  )

  const displayLayouts = useMemo(
    () => layoutsForVisible(layouts, visibleWidgetIds),
    [layouts, visibleWidgetIds]
  )

  if (!loaded) return (
    <div className="text-[var(--color-text-muted)] text-xs py-8 text-center font-mono uppercase tracking-widest">
      Loading grid...
    </div>
  )

  return (
      <GridWrapper
      layouts={displayLayouts}
      onLayoutChange={handleLayoutChange}
      rowHeight={HUB_GRID.rowHeight}
      margin={[...HUB_GRID.margin]}
      persistenceKey="adversity-hub-pixels-v1"
      draggableHandle=".widget-drag-bar"
    >
      {visibleWidgetIds.map(id => {
        const entry = registryById.get(id)
        if (!entry) return null
        const Component = entry.component
        const isSelected = selectedId === id

        return (
          <div
            key={id}
            className={`widget-shell-group transition-all duration-200 ${switchMode ? 'cursor-pointer' : ''}`}
            onClick={() => onWidgetClick?.(id)}
          >
            <div className={`relative ${isSelected ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]' : ''}`}>
              {switchMode && (
                <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 flex items-center justify-center">
                  <Check size={10} className="text-[var(--color-accent)]" />
                </div>
              )}
              <WidgetShell
                id={id}
                label={entry.label}
                onHide={() => onHide(id)}
                onDelete={() => onDelete(id)}
              >
                <Component />
              </WidgetShell>
            </div>
          </div>
        )
      })}
    </GridWrapper>
  )
}
