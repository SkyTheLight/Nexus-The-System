'use client'

import { useState } from 'react'
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary'
import { GridWrapper } from '@/components/shared/GridWrapper'
import { useGridLayout } from '@/hooks/useGridLayout'
import TopNav from '@/components/TopNav'
import GreetingWidget from '@/app/main/components/GreetingWidget'
import HolidayWidget from '@/app/main/components/HolidayWidget'
import MotivationWidget from '@/app/main/components/MotivationWidget'
import TasksWidget from '@/app/main/components/TasksWidget'
import PinnedWidget from '@/app/main/components/PinnedWidget'
import ClassesWidget from '@/app/main/components/ClassesWidget'
import PHNewsWidget from '@/app/main/components/PHNewsWidget'
import { MAIN_DEFAULT_LAYOUTS } from '@/lib/layout'
import { Check, Move } from 'lucide-react'

const WIDGET_IDS = ['greeting', 'holiday', 'motivation', 'tasks', 'pinned', 'classes', 'ph-news']

const widgetMap: Record<string, React.ComponentType> = {
  greeting: GreetingWidget,
  holiday: HolidayWidget,
  motivation: MotivationWidget,
  tasks: TasksWidget,
  pinned: PinnedWidget,
  classes: ClassesWidget,
  'ph-news': PHNewsWidget,
}

const widgetLabels: Record<string, string> = {
  greeting: 'SYSTEM',
  holiday: 'CALENDAR',
  motivation: 'DIRECTIVE',
  tasks: 'OBJECTIVES',
  pinned: 'INTEL',
  classes: 'SCHEDULE',
  'ph-news': 'INTEL FEED',
}

export default function MainPage() {
  return (
    <PageErrorBoundary>
      <MainPageInner />
    </PageErrorBoundary>
  )
}

function MainPageInner() {
  const [adjustmentMode, setAdjustmentMode] = useState(false)
  const {
    layouts, handleLayoutChange, loaded,
    switchMode, selectedId, handleWidgetClick,
  } = useGridLayout({
    page: 'main',
    defaultLayouts: MAIN_DEFAULT_LAYOUTS,
    widgetIds: WIDGET_IDS,
  })

  const currentLayout = layouts.lg || []

  return (
    <div className="min-h-screen bg-[#06060a] font-mono">
      <TopNav />
      <div className="flex items-center justify-end px-6 py-2">
        <button
          onClick={() => setAdjustmentMode(!adjustmentMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors text-xs ${
            adjustmentMode
              ? 'bg-[#a855f7] text-black border-[#a855f7] font-bold'
              : 'bg-white/5 hover:bg-white/10 border-[var(--color-border)] text-[var(--color-text-muted)]'
          }`}
        >
          <Move size={14} /> {adjustmentMode ? 'DONE' : 'ARRANGE'}
        </button>
      </div>
      {!loaded ? (
        <div className="flex items-center justify-center h-[calc(100vh-40px)]">
          <div className="text-[var(--sl-gold)] text-xs tracking-widest uppercase animate-pulse">
            ◈ Loading HUD...
          </div>
        </div>
      ) : (
        <>
          <GridWrapper
            layouts={layouts}
            onLayoutChange={adjustmentMode ? handleLayoutChange : undefined}
            adjustable={adjustmentMode}
            persistenceKey="adversity-main-pixels-v1"
          >
            {currentLayout.map(item => {
              const Component = widgetMap[item.i]
              if (!Component) return null
              const isSelected = selectedId === item.i

              return (
                <div
                  key={item.i}
                  className={`widget-shell-group ${switchMode ? 'cursor-pointer' : ''} ${isSelected ? 'swap-selected' : ''}`}
                  onClick={() => handleWidgetClick(item.i)}
                >
                  <div className={`hud-card h-full flex flex-col ${isSelected ? 'ring-2 ring-[var(--sl-gold)] ring-offset-2 ring-offset-[#06060a]' : ''}`}>
                    {switchMode && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[var(--sl-gold)]/20 border border-[var(--sl-gold)]/40 flex items-center justify-center">
                        <Check size={10} className="text-[var(--sl-gold)]" />
                      </div>
                    )}
                    <div className="widget-drag-bar flex items-center gap-2 px-4 py-1.5 border-b border-[rgba(215,179,106,0.12)] shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-[var(--sl-gold)]' : 'bg-[var(--sl-gold)]/40'}`} />
                      <span className="text-[8px] font-mono text-[var(--sl-text-muted)] uppercase tracking-[0.2em]">{widgetLabels[item.i]}</span>
                    </div>
                    <div className="widget-no-drag flex-1 p-4 overflow-auto">
                      <Component />
                    </div>
                  </div>
                </div>
              )
            })}
          </GridWrapper>
        </>
      )}
    </div>
  )
}
