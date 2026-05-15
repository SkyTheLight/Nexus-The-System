'use client'

import { useState, useEffect, useCallback } from 'react'
import { ResponsiveGridLayout } from 'react-grid-layout'
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
const STORAGE_KEY = 'adversity-main-layout'

const DEFAULT_LAYOUT = [
  { i: 'greeting', x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  { i: 'holiday', x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  { i: 'motivation', x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  { i: 'tasks', x: 0, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'pinned', x: 4, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'classes', x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'ph-news', x: 0, y: 6, w: 12, h: 3, minW: 6, minH: 2 },
]

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
  const [layout, setLayout] = useState(DEFAULT_LAYOUT)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLayout(parsed)
        }
      }
    } catch {}
    setInitialized(true)
  }, [])

  const onLayoutChange = useCallback((currentLayout: any[]) => {
    const lg = currentLayout.map((item: any) => ({
      i: item.i, x: item.x, y: item.y, w: item.w, h: item.h,
      minW: item.minW, minH: item.minH, maxW: item.maxW,
    }))
    setLayout(lg)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lg))
    } catch {}
  }, [])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#050508]">
        <TopNav />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-sm font-mono text-[#4a5568]">INITIALIZING SYSTEM...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050508] font-mono">
      <TopNav />
      <div className="p-4 md:p-6 w-full" style={{ width: '100%', minHeight: '100vh' }}>
        <ResponsiveGridLayout
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 1 }}
          rowHeight={60}
          gap={[8, 8]}
          layouts={{ lg: layout }}
          onLayoutChange={onLayoutChange}
          draggableHandle=".main-drag-handle"
          resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
          compactType="vertical"
          isResizable={true}
          isDraggable={true}
          useCSSTransforms={true}
          margin={[8, 8]}
        >
          {layout.map(item => {
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
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}
