'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import LiquidBackground from '@/components/LiquidBackground'
import ManageWidgetsPanel from '@/components/dashboard/ManageWidgetsPanel'
import WidgetPicker from '@/components/dashboard/WidgetPicker'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'
import { useSwitchableGrid } from '@/hooks/useSwitchableGrid'
import { HUB_DEFAULT_LAYOUTS } from '@/lib/layout'
import { Settings, Plus, Shuffle, RotateCcw, Check } from 'lucide-react'

const HIDDEN_KEY = 'adversity-hub-hidden'
const DELETED_KEY = 'adversity-hub-deleted'

function loadSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function saveSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]))
  } catch {}
}

const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

export default function HubPage() {
  const { sidebarOpen } = useAppStore()
  const [initialized, setInitialized] = useState(false)
  const [hiddenSet, setHiddenSet] = useState<Set<string>>(new Set())
  const [deletedSet, setDeletedSet] = useState<Set<string>>(new Set())
  const [manageOpen, setManageOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    setHiddenSet(loadSet(HIDDEN_KEY))
    setDeletedSet(loadSet(DELETED_KEY))
    setInitialized(true)
  }, [])

  const allIds = useMemo(() => WIDGET_REGISTRY.map(w => w.id), [])

  const visibleWidgetIds = useMemo(
    () => allIds.filter(id => !hiddenSet.has(id) && !deletedSet.has(id)),
    [allIds, hiddenSet, deletedSet]
  )

  const hiddenWidgets = useMemo(
    () => allIds.filter(id => hiddenSet.has(id) && !deletedSet.has(id)),
    [allIds, hiddenSet, deletedSet]
  )

  const deletedWidgets = useMemo(
    () => allIds.filter(id => deletedSet.has(id)),
    [allIds, deletedSet]
  )

  const existingIds = useMemo(
    () => new Set([...visibleWidgetIds, ...hiddenWidgets]),
    [visibleWidgetIds, hiddenWidgets]
  )

  const hideWidget = useCallback((id: string) => {
    setHiddenSet(prev => {
      const next = new Set(prev)
      next.add(id)
      saveSet(HIDDEN_KEY, next)
      return next
    })
  }, [])

  const showWidget = useCallback((id: string) => {
    setHiddenSet(prev => {
      const next = new Set(prev)
      next.delete(id)
      saveSet(HIDDEN_KEY, next)
      return next
    })
  }, [])

  const deleteWidget = useCallback((id: string) => {
    setDeletedSet(prev => {
      const next = new Set(prev)
      next.add(id)
      saveSet(DELETED_KEY, next)
      return next
    })
  }, [])

  const restoreWidget = useCallback((id: string) => {
    setDeletedSet(prev => {
      const next = new Set(prev)
      next.delete(id)
      saveSet(DELETED_KEY, next)
      return next
    })
    setHiddenSet(prev => {
      const next = new Set(prev)
      next.delete(id)
      saveSet(HIDDEN_KEY, next)
      return next
    })
  }, [])

  const addWidget = useCallback((id: string) => {
    restoreWidget(id)
  }, [restoreWidget])

  const { layouts, loaded, switchMode, setSwitchMode, selectedId, handleWidgetClick, resetLayout } = useSwitchableGrid({
    page: 'hub',
    defaultLayouts: HUB_DEFAULT_LAYOUTS,
    widgetIds: visibleWidgetIds,
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

  if (!initialized) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-[var(--color-text-muted)] text-sm">Loading...</div>
        </main>
      </div>
    )
  }

  const layout = loaded ? (layouts[currentBp] || layouts.lg || []) : []
  const registryById = new Map(WIDGET_REGISTRY.map(w => [w.id, w]))
  const cols = GRID_COLS[currentBp as keyof typeof GRID_COLS] || 12

  return (
    <div className="flex h-screen overflow-hidden">
      <LiquidBackground />
      <Sidebar />
      <main className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <TopNav />

        <div className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-6 pb-2">
          <div>
            <h1 className="text-lg font-bold text-white">Focus Board</h1>
            <p className="text-xs text-[var(--color-text-muted)]">Your personal command center</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSwitchMode(!switchMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                switchMode
                  ? 'bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)]'
                  : 'bg-white/5 hover:bg-white/10 border border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              <Shuffle size={12} />
              {switchMode ? 'Switch ON' : 'Switch'}
            </button>
            {switchMode && (
              <button
                onClick={resetLayout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-[var(--color-border)] text-[var(--color-text-muted)] transition-all"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
            {!switchMode && (
              <>
                <button
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border)] transition-colors text-xs text-[var(--color-text-muted)]"
                >
                  <Plus size={14} />
                  Add
                </button>
                <button
                  onClick={() => setManageOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border)] transition-colors text-xs text-[var(--color-text-muted)]"
                >
                  <Settings size={14} />
                  Customize
                </button>
              </>
            )}
          </div>
        </div>

        {switchMode && selectedId && (
          <div className="px-4 md:px-6 pb-2">
            <div className="text-[10px] font-mono text-[var(--color-accent)] uppercase tracking-wider">
              Selected: {registryById.get(selectedId)?.label} — click another widget to swap positions
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          {visibleWidgetIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-sm text-[var(--color-text-muted)] mb-4">
                {deletedWidgets.length > 0
                  ? 'All widgets are hidden or deleted.'
                  : 'Your dashboard is empty.'}
              </div>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors"
              >
                <Plus size={16} />
                Add widgets
              </button>
            </div>
          ) : (
            <div
              className="hub-grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
              }}
            >
              {layout.map(item => {
                if (!visibleWidgetIds.includes(item.i)) return null
                const entry = registryById.get(item.i)
                if (!entry) return null
                const Component = entry.component
                const isSelected = selectedId === item.i

                return (
                  <div
                    key={item.i}
                    className="hub-cell transition-all duration-200"
                    style={{
                      gridColumn: `span ${item.w}`,
                      gridRow: `span ${item.h}`,
                      cursor: switchMode ? 'pointer' : 'default',
                    }}
                    onClick={() => handleWidgetClick(item.i)}
                  >
                    <div className={`hub-widget-card h-full flex flex-col ${isSelected ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]' : ''}`}>
                      {switchMode && (
                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 flex items-center justify-center">
                          <Check size={10} className="text-[var(--color-accent)]" />
                        </div>
                      )}
                      <div className="widget-drag-bar flex items-center justify-between px-3 py-2 border-b border-white/5 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-text-muted)]/30'}`} />
                          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider truncate">
                            {entry.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3">
                        <Component />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <ManageWidgetsPanel
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        visibleWidgets={visibleWidgetIds}
        hiddenWidgets={hiddenWidgets}
        deletedWidgets={deletedWidgets}
        onShow={showWidget}
        onHide={hideWidget}
        onRestore={restoreWidget}
        onAddNew={() => { setManageOpen(false); setPickerOpen(true) }}
      />

      <WidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        existingIds={existingIds}
        onAdd={addWidget}
      />
    </div>
  )
}
