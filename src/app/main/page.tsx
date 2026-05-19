'use client'

import { useState, useEffect } from 'react'
import TopNav from '@/components/TopNav'
import GreetingWidget from '@/app/main/components/GreetingWidget'
import HolidayWidget from '@/app/main/components/HolidayWidget'
import MotivationWidget from '@/app/main/components/MotivationWidget'
import TasksWidget from '@/app/main/components/TasksWidget'
import PinnedWidget from '@/app/main/components/PinnedWidget'
import ClassesWidget from '@/app/main/components/ClassesWidget'
import PHNewsWidget from '@/app/main/components/PHNewsWidget'
import { useSwitchableGrid } from '@/hooks/useSwitchableGrid'
import { MAIN_DEFAULT_LAYOUTS } from '@/lib/layout'
import { Shuffle, RotateCcw, Check } from 'lucide-react'

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
  const { layouts, loaded, switchMode, setSwitchMode, selectedId, handleWidgetClick, resetLayout } = useSwitchableGrid({
    page: 'main',
    defaultLayouts: MAIN_DEFAULT_LAYOUTS,
    widgetIds: WIDGET_IDS,
  })

  const [currentBp, setCurrentBp] = useState('lg')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w >= 1200) setCurrentBp('lg')
      else if (w >= 996) setCurrentBp('md')
      else if (w >= 768) setCurrentBp('sm')
      else if (w >= 480) setCurrentBp('xs')
      else setCurrentBp('xxs')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#06060a] font-mono flex items-center justify-center">
        <div className="text-[#d7b36a] text-sm animate-pulse">LOADING HUD...</div>
      </div>
    )
  }

  const layout = layouts[currentBp] || layouts.lg || []

  return (
    <div className="min-h-screen bg-[#06060a] font-mono">
      <TopNav />

      {/* Switch mode toolbar */}
      <div className="border-b border-[rgba(215,179,106,0.12)] bg-[#06060a]/80 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSwitchMode(!switchMode); setSelectedId(null) }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                switchMode
                  ? 'bg-[#d7b36a]/20 border border-[#d7b36a]/40 text-[#d7b36a]'
                  : 'bg-white/5 border border-[rgba(215,179,106,0.15)] text-[#6b5a30] hover:text-[#d7b36a]'
              }`}
            >
              <Shuffle size={12} />
              {switchMode ? 'Switch Mode ON' : 'Switch Mode'}
            </button>
            {switchMode && (
              <span className="text-[10px] text-[#6b5a30] font-mono">
                {selectedId ? `Selected: ${widgetLabels[selectedId]} — click another to swap` : 'Click a widget to select'}
              </span>
            )}
          </div>
          {switchMode && (
            <button
              onClick={resetLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider bg-white/5 border border-[rgba(215,179,106,0.15)] text-[#6b5a30] hover:text-[#d7b36a] transition-all"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      <main className="px-4 md:px-6 lg:px-8 py-4 max-w-[1600px] mx-auto">
        <div className="hud-grid">
          {layout.map(item => {
            const Component = widgetMap[item.i]
            if (!Component) return null
            const isSelected = selectedId === item.i

            return (
              <div
                key={item.i}
                className={`hud-cell hud-cell-${item.i} transition-all duration-200 ${
                  switchMode ? 'cursor-pointer' : ''
                } ${isSelected ? 'ring-2 ring-[#d7b36a] ring-offset-2 ring-offset-[#06060a]' : ''}`}
                onClick={() => handleWidgetClick(item.i)}
              >
                <div className={`hud-card h-full flex flex-col ${isSelected ? 'border-[#d7b36a]' : ''}`}>
                  {switchMode && (
                    <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[#d7b36a]/20 border border-[#d7b36a]/40 flex items-center justify-center">
                      <Check size={10} className="text-[#d7b36a]" />
                    </div>
                  )}
                  <div className="widget-drag-bar flex items-center gap-2 px-4 py-1.5 border-b border-[rgba(215,179,106,0.12)] shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-[#d7b36a]' : 'bg-[#d7b36a]/40'}`} />
                    <span className="text-[8px] font-mono text-[#6b5a30] uppercase tracking-[0.2em]">{widgetLabels[item.i]}</span>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    <Component />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
