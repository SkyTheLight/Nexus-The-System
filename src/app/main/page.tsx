'use client'

import { useState, useCallback } from 'react'
import { Responsive, useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import TopNav from '@/components/TopNav'
import GreetingWidget from '@/app/main/components/GreetingWidget'
import HolidayWidget from '@/app/main/components/HolidayWidget'
import MotivationWidget from '@/app/main/components/MotivationWidget'
import TasksWidget from '@/app/main/components/TasksWidget'
import PinnedWidget from '@/app/main/components/PinnedWidget'
import ClassesWidget from '@/app/main/components/ClassesWidget'
import PHNewsWidget from '@/app/main/components/PHNewsWidget'

const LAYOUT_KEY = 'adversity-main-layout'

const defaultLayout = {
  lg: [
    { i: 'greeting',    x: 0,  y: 0,  w: 4, h: 4 },
    { i: 'holiday',     x: 4,  y: 0,  w: 4, h: 4 },
    { i: 'motivation',  x: 8,  y: 0,  w: 4, h: 4 },
    { i: 'tasks',       x: 0,  y: 4,  w: 4, h: 6 },
    { i: 'pinned',      x: 4,  y: 4,  w: 4, h: 6 },
    { i: 'classes',     x: 8,  y: 4,  w: 4, h: 6 },
    { i: 'ph-news',     x: 0,  y: 10, w: 12, h: 5 },
  ],
}

const getSavedLayout = () => {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.lg) return parsed
    }
    return defaultLayout
  } catch {
    return defaultLayout
  }
}

const WIDGET_MAP: Record<string, React.ComponentType> = {
  greeting: GreetingWidget,
  holiday: HolidayWidget,
  motivation: MotivationWidget,
  tasks: TasksWidget,
  pinned: PinnedWidget,
  classes: ClassesWidget,
  'ph-news': PHNewsWidget,
}

export default function MainPage() {
  const { containerRef, width } = useContainerWidth()
  const [layouts, setLayouts] = useState(getSavedLayout)

  const handleLayoutChange = useCallback((_currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts)
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(allLayouts))
    } catch {}
  }, [])

  const resetLayout = useCallback(() => {
    try {
      localStorage.removeItem(LAYOUT_KEY)
    } catch {}
    setLayouts(defaultLayout)
  }, [])

  return (
    <div className="min-h-screen bg-[#050508] font-mono">
      <TopNav onResetLayout={resetLayout} />
      <div ref={containerRef} className="p-4 md:p-6" style={{ width: '100%', minHeight: '100vh' }}>
        <Responsive
          width={width}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={60}
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          useCSSTransforms={true}
          compactType="vertical"
          margin={[12, 12]}
        >
          {layouts.lg.map((item: any) => {
            const Component = WIDGET_MAP[item.i]
            if (!Component) return <div key={item.i} />
            return (
              <div key={item.i} className="hud-card flex flex-col">
                <div className="flex-1">
                  <Component />
                </div>
              </div>
            )
          })}
        </Responsive>
      </div>
    </div>
  )
}
