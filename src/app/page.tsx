'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import JARVISLoader from '@/components/JarvisLoader'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import TodoWidget from '@/components/widgets/Todo'
import GoalsWidget from '@/components/widgets/Goals'
import IdeasWidget from '@/components/widgets/Ideas'
import NotesWidget from '@/components/widgets/Notes'
import MusicWidget from '@/components/widgets/Music'
import CertificatesWidget from '@/components/widgets/Certificates'
import DevWidget from '@/components/widgets/Dev'
import PerformanceWidget from '@/components/widgets/Performance'
import TimelineWidget from '@/components/widgets/Timeline'
import GitHubWidget from '@/components/widgets/GitHub'
import AssignmentWidget from '@/components/widgets/Assignment'
import AIWebsitesWidget from '@/components/widgets/AIWebsites'
import SchoolLinksWidget from '@/components/widgets/SchoolLinks'
import QuickLinksWidget from '@/components/widgets/QuickLinks'
import SiteButtonsWidget from '@/components/widgets/SiteButtons'
import SpotifyNowPlayingWidget from '@/components/widgets/SpotifyNowPlaying'
import AIChatWidget from '@/components/widgets/AIChat'
import CalendarWidget from '@/components/widgets/Calendar'
import LevelWidget from '@/components/widgets/Level'
import DateHighlightWidget from '@/components/widgets/DateHighlight'
import WeatherWidget from '@/components/widgets/Weather'
// import GitHubContributions from '@/components/widgets/GitHubContributions'
import ClassScheduleWidget from '@/components/widgets/ClassSchedule'
import CanvasAnnouncements from '@/components/widgets/CanvasAnnouncements'
import ScreenTimeWidget from '@/components/widgets/ScreenTime'
import StatsCards from '@/components/StatsCards'
import ClockWidget from '@/components/ClockWidget'
import PomodoroTimer from '@/components/PomodoroTimer'
import QuoteCarousel from '@/components/QuoteCarousel'
import LiquidBackground from '@/components/LiquidBackground'
import { getDashboardLayout, saveDashboardLayout, type DashboardWidget } from '@/lib/api'
import { useTaskNotifications } from '@/hooks/useTaskNotifications'
import { GripVertical, Plus, X } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const widgetComponents: Record<string, any> = {
  todos: TodoWidget,
  goals: GoalsWidget,
  ideas: IdeasWidget,
  notes: NotesWidget,
  music: MusicWidget,
  certificates: CertificatesWidget,
  dev: DevWidget,
  performance: PerformanceWidget,
  timeline: TimelineWidget,
  github: GitHubWidget,
  assignments: AssignmentWidget,
  'ai-websites': AIWebsitesWidget,
  'school-links': SchoolLinksWidget,
  'quick-links': QuickLinksWidget,
  'site-buttons': SiteButtonsWidget,
  'spotify-now': SpotifyNowPlayingWidget,
  'ai-chat': AIChatWidget,
  'calendar': CalendarWidget,
  'level': LevelWidget,
  'date-highlight': DateHighlightWidget,
  'weather': WeatherWidget,
  // 'github-contributions': GitHubContributions,
  'class-schedule': ClassScheduleWidget,
  'canvas-announcements': CanvasAnnouncements,
  'screen-time': ScreenTimeWidget,
}

const defaultLayout: DashboardWidget[] = [
  { widget_id: 'todos', x: 0, y: 0, w: 2, h: 2, visible: true },
  { widget_id: 'goals', x: 2, y: 0, w: 2, h: 2, visible: true },
  { widget_id: 'ideas', x: 4, y: 0, w: 2, h: 2, visible: true },
  { widget_id: 'notes', x: 0, y: 2, w: 2, h: 2, visible: true },
  { widget_id: 'music', x: 2, y: 2, w: 2, h: 2, visible: true },
  { widget_id: 'certificates', x: 4, y: 2, w: 2, h: 2, visible: true },
  { widget_id: 'dev', x: 0, y: 4, w: 2, h: 2, visible: true },
  { widget_id: 'performance', x: 2, y: 4, w: 2, h: 2, visible: true },
  { widget_id: 'timeline', x: 4, y: 4, w: 2, h: 2, visible: true },
  { widget_id: 'github', x: 0, y: 6, w: 3, h: 2, visible: true },
  { widget_id: 'assignments', x: 3, y: 6, w: 3, h: 2, visible: true },
  { widget_id: 'ai-websites', x: 0, y: 8, w: 2, h: 2, visible: true },
  { widget_id: 'school-links', x: 2, y: 8, w: 2, h: 2, visible: true },
  { widget_id: 'quick-links', x: 4, y: 8, w: 2, h: 2, visible: true },
  { widget_id: 'site-buttons', x: 6, y: 8, w: 2, h: 2, visible: true },
  { widget_id: 'spotify-now', x: 8, y: 8, w: 2, h: 2, visible: true },
  { widget_id: 'ai-chat', x: 8, y: 8, w: 2, h: 2, visible: true },
  { widget_id: 'calendar', x: 6, y: 10, w: 2, h: 2, visible: true },
  { widget_id: 'level', x: 8, y: 10, w: 2, h: 2, visible: true },
  { widget_id: 'date-highlight', x: 10, y: 10, w: 2, h: 2, visible: true },
  { widget_id: 'weather', x: 12, y: 10, w: 2, h: 2, visible: true },
  // 'github-contributions': GitHubContributions,
  { widget_id: 'class-schedule', x: 6, y: 12, w: 2, h: 2, visible: true },
  { widget_id: 'canvas-announcements', x: 8, y: 12, w: 2, h: 2, visible: true },
   { widget_id: 'screen-time', x: 10, y: 12, w: 2, h: 2, visible: false }, // Disabled: React error #310
  ]

function SortableWidget({ widget, onHide, onResize }: { widget: DashboardWidget; onHide: () => void; onResize: (w: number, h: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.widget_id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.w}`,
    gridRow: `span ${widget.h}`,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  }

  const WidgetComponent = widgetComponents[widget.widget_id]

  const startResize = (direction: 'right' | 'bottom' | 'corner', e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    const startX = e.clientX
    const startY = e.clientY
    const startW = widget.w
    const startH = widget.h

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      const cellSize = 50 // approximate cell size in pixels

      if (direction === 'right' || direction === 'corner') {
        const newW = Math.max(1, startW + Math.round(deltaX / cellSize))
        widget.w = newW
      }
      if (direction === 'bottom' || direction === 'corner') {
        const newH = Math.max(1, startH + Math.round(deltaY / cellSize))
        widget.h = newH
      }
      onResize(widget.w, widget.h)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-4 relative group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move"
          >
            <GripVertical size={14} className="text-muted-foreground" />
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onHide() }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
          title="Hide widget"
        >
          <X size={12} className="text-muted-foreground hover:text-red-400" />
        </button>
      </div>
      {WidgetComponent && <WidgetComponent />}
      
      {/* Resize handles */}
      <div
        className="absolute right-0 top-0 w-2 h-full cursor-e-resize hover:bg-blue-500/20"
        onMouseDown={(e) => startResize('right', e)}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize hover:bg-blue-500/20"
        onMouseDown={(e) => startResize('bottom', e)}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-blue-500/20"
        onMouseDown={(e) => startResize('corner', e)}
      />
    </div>
  )
}

export default function Home() {
  const { sidebarOpen } = useAppStore()
  const [layout, setLayout] = useState<DashboardWidget[]>([])
  const [loading, setLoading] = useState(true)
  const [jarvisDone, setJarvisDone] = useState(() => {
    // Persist across re-renders — JARVIS only runs once per session
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('jarvis-done') === 'true'
    }
    return false
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadLayout()
  }, [])

  // Safety net MUST be before any conditional returns (React rules of hooks)
  // If JARVIS hasn't completed in 10s, force it through
  useEffect(() => {
    if (jarvisDone) return
    const safetyNet = setTimeout(() => {
      console.log('[PAGE] Safety net triggered - forcing JARVIS to complete')
      sessionStorage.setItem('jarvis-done', 'true')
      setJarvisDone(true)
    }, 10000)
    return () => clearTimeout(safetyNet)
  }, [jarvisDone])

  function loadLayout() {
    console.log('Loading layout...')
    
    // Load from localStorage (100% reliable)
    const saved = localStorage.getItem('widget-layout')
    if (saved) {
      try {
        const savedLayout: DashboardWidget[] = JSON.parse(saved)
        if (savedLayout && savedLayout.length > 0) {
          // Merge saved layout with any new widgets from defaultLayout
          const savedIds = new Set(savedLayout.map(w => w.widget_id))
          const newWidgets = defaultLayout.filter(w => !savedIds.has(w.widget_id))
          
          // Use saved layout but ensure new widgets are visible
          const finalLayout = [...savedLayout, ...newWidgets.map(w => ({ ...w, visible: true }))]
          
          console.log('Loaded layout from localStorage:', finalLayout.map(w => ({ id: w.widget_id, visible: w.visible })))
          setLayout(finalLayout)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error('localStorage parse failed:', e)
      }
    }
    
    // Fallback to default
    console.log('Using default layout')
    setLayout(defaultLayout)
    setLoading(false)
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setLayout(prevLayout => {
      const oldIndex = prevLayout.findIndex(w => w.widget_id === active.id)
      const newIndex = prevLayout.findIndex(w => w.widget_id === over.id)

      if (oldIndex === -1 || newIndex === -1) return prevLayout

      const newLayout = [...prevLayout]
      const [moved] = newLayout.splice(oldIndex, 1)
      newLayout.splice(newIndex, 0, moved)

      // Save full layout to localStorage (preserves visibility)
      localStorage.setItem('widget-layout', JSON.stringify(newLayout))
      console.log('Layout saved to localStorage:', newLayout.map(w => ({ id: w.widget_id, visible: w.visible })))
      
      return newLayout
    })
  }, [])

  const updateWidgetSize = useCallback((widgetId: string, newW: number, newH: number) => {
    setLayout(prevLayout => {
      const newLayout = prevLayout.map(w =>
        w.widget_id === widgetId ? { ...w, w: Math.max(1, newW), h: Math.max(1, newH) } : w
      )
      localStorage.setItem('widget-layout', JSON.stringify(newLayout))
      return newLayout
    })
  }, [])

  const hideWidget = useCallback(async (widgetId: string) => {
    setLayout(prevLayout => {
      const newLayout = prevLayout.map(w =>
        w.widget_id === widgetId ? { ...w, visible: false } : w
      )
      // Save full layout to localStorage
      localStorage.setItem('widget-layout', JSON.stringify(newLayout))
      console.log('Widget hidden:', widgetId, '- Layout saved')
      return newLayout
    })
  }, [])

  const restoreWidget = useCallback(async (widgetId: string) => {
    setLayout(prevLayout => {
      const newLayout = prevLayout.map(w =>
        w.widget_id === widgetId ? { ...w, visible: true } : w
      )
      // Save full layout to localStorage
      localStorage.setItem('widget-layout', JSON.stringify(newLayout))
      console.log('Widget restored:', widgetId, '- Layout saved')
      return newLayout
    })
  }, [])

  const hiddenWidgets = layout.filter(w => !w.visible)

  console.log('[PAGE] loading:', loading)
  console.log('[PAGE] CANVAS_DOMAIN:', process.env.NEXT_PUBLIC_CANVAS_DOMAIN ? 'set' : 'missing')
  console.log('[PAGE] CANVAS_TOKEN:', process.env.NEXT_PUBLIC_CANVAS_TOKEN ? 'set' : 'missing')

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </main>
      </div>
    )
  }

  // Show JARVIS loader on first visit
  if (!jarvisDone) {
    console.log('[PAGE] Rendering JARVIS Loader...')
    return (
      <JARVISLoader
        userName="Sir"
        canvasDomain={process.env.NEXT_PUBLIC_CANVAS_DOMAIN || ''}
        canvasToken={process.env.NEXT_PUBLIC_CANVAS_TOKEN || ''}
        courseIds={[]}
        onComplete={() => {
          console.log('[PAGE] JARVIS onComplete called')
          sessionStorage.setItem('jarvis-done', 'true')
          setJarvisDone(true)
        }}
      />
    )
  }

  const visibleWidgets = layout.filter(w => w.visible)

  return (
    <div className="flex h-screen overflow-hidden">
      <LiquidBackground />
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col relative z-10">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Focus Board</h1>
            <p className="text-[13px] text-[var(--color-text-muted)] mt-1">Your personal command center</p>
          </div>

          <StatsCards />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ClockWidget />
            <PomodoroTimer />
            <QuoteCarousel />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleWidgets.map(w => w.widget_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleWidgets.map(widget => (
                  <SortableWidget
                    key={widget.widget_id}
                    widget={widget}
                    onHide={() => hideWidget(widget.widget_id)}
                    onResize={(w, h) => updateWidgetSize(widget.widget_id, w, h)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {hiddenWidgets.length > 0 && (
            <div className="mt-6 p-4 bg-[#0B0B0C] border border-white/10 rounded-2xl">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Hidden Widgets</h3>
              <div className="flex flex-wrap gap-2">
                {hiddenWidgets.map(widget => (
                  <button
                    key={widget.widget_id}
                    onClick={() => restoreWidget(widget.widget_id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#111113] border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm"
                  >
                    <Plus size={14} />
                    {widget.widget_id.charAt(0).toUpperCase() + widget.widget_id.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
