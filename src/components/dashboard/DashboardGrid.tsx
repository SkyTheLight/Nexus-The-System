'use client'

import { useMemo } from 'react'
import { GridWrapper } from '@/components/shared/GridWrapper'
import WidgetShell from './WidgetShell'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'
import { HUB_GRID, layoutsForVisible } from '@/lib/layout'
import type { Layout, Layouts } from 'react-grid-layout'
import { Check } from 'lucide-react'

interface DashboardGridProps {
  visibleWidgetIds: string[]
  displayLayouts: Layouts
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void
  onHide:   (id: string) => void
  onDelete: (id: string) => void
  switchMode?: boolean
  selectedId?: string | null
  onWidgetClick?: (id: string) => void
}

export default function DashboardGrid({
  visibleWidgetIds, displayLayouts, onLayoutChange,
  onHide, onDelete, switchMode, selectedId, onWidgetClick,
}: DashboardGridProps) {
  const registryById = useMemo(
    () => new Map(WIDGET_REGISTRY.map(w => [w.id, w])),
    []
  )

  return (
    <GridWrapper
      layouts={displayLayouts}
      onLayoutChange={onLayoutChange}
      rowHeight={HUB_GRID.rowHeight}
      margin={[...HUB_GRID.margin]}
      persistenceKey="adversity-hub-pixels-v1"
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
