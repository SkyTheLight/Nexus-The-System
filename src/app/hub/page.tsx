'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import LiquidBackground from '@/components/LiquidBackground'
import DashboardGrid from '@/components/dashboard/DashboardGrid'
import ManageWidgetsPanel from '@/components/dashboard/ManageWidgetsPanel'
import WidgetPicker from '@/components/dashboard/WidgetPicker'
import GridControlPanel from '@/components/shared/GridControlPanel'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'
import { useGridLayout } from '@/hooks/useGridLayout'
import { HUB_DEFAULT_LAYOUTS } from '@/lib/layout'
import { Settings, Plus, Check } from 'lucide-react'

const HIDDEN_KEY  = 'adversity-hub-hidden'
const DELETED_KEY = 'adversity-hub-deleted'

function loadSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) } catch { return new Set() }
}
function saveSet(key: string, set: Set<string>) {
  try { localStorage.setItem(key, JSON.stringify([...set])) } catch {}
}

export default function HubPage() {
  const { sidebarOpen } = useAppStore()
  const [initialized, setInitialized] = useState(false)
  const [hiddenSet,   setHiddenSet]   = useState<Set<string>>(new Set())
  const [deletedSet,  setDeletedSet]  = useState<Set<string>>(new Set())
  const [manageOpen,  setManageOpen]  = useState(false)
  const [pickerOpen,  setPickerOpen]  = useState(false)

  useEffect(() => {
    setHiddenSet(loadSet(HIDDEN_KEY))
    setDeletedSet(loadSet(DELETED_KEY))
    setInitialized(true)
  }, [])

  const allIds           = useMemo(() => WIDGET_REGISTRY.map(w => w.id), [])
  const visibleWidgetIds = useMemo(() => allIds.filter(id => !hiddenSet.has(id) && !deletedSet.has(id)), [allIds, hiddenSet, deletedSet])
  const hiddenWidgets    = useMemo(() => allIds.filter(id => hiddenSet.has(id) && !deletedSet.has(id)), [allIds, hiddenSet, deletedSet])
  const deletedWidgets   = useMemo(() => allIds.filter(id => deletedSet.has(id)), [allIds, deletedSet])
  const existingIds      = useMemo(() => new Set([...visibleWidgetIds, ...hiddenWidgets]), [visibleWidgetIds, hiddenWidgets])

  const hideWidget    = useCallback((id: string) => setHiddenSet(prev  => { const n = new Set(prev); n.add(id);    saveSet(HIDDEN_KEY,  n); return n }), [])
  const showWidget    = useCallback((id: string) => setHiddenSet(prev  => { const n = new Set(prev); n.delete(id); saveSet(HIDDEN_KEY,  n); return n }), [])
  const deleteWidget  = useCallback((id: string) => setDeletedSet(prev => { const n = new Set(prev); n.add(id);    saveSet(DELETED_KEY, n); return n }), [])
  const restoreWidget = useCallback((id: string) => {
    setDeletedSet(prev => { const n = new Set(prev); n.delete(id); saveSet(DELETED_KEY, n); return n })
    setHiddenSet(prev  => { const n = new Set(prev); n.delete(id); saveSet(HIDDEN_KEY,  n); return n })
  }, [])
  const addWidget = useCallback((id: string) => restoreWidget(id), [restoreWidget])

  const {
    layouts, handleLayoutChange, loaded,
    switchMode, setSwitchMode, selectedId, handleWidgetClick,
    resetLayout, shuffleLayout, applyPreset, resizeWidget,
    gridOverlay, setGridOverlay,
  } = useGridLayout({
    page: 'hub',
    defaultLayouts: HUB_DEFAULT_LAYOUTS,
    widgetIds: visibleWidgetIds,
  })

  if (!initialized) return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-[var(--color-text-muted)] text-sm">Loading...</div>
      </main>
    </div>
  )

  const registryById = new Map(WIDGET_REGISTRY.map(w => [w.id, w]))

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
            {!switchMode && (
              <>
                <button onClick={() => setPickerOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border)] transition-colors text-xs text-[var(--color-text-muted)]">
                  <Plus size={14} /> Add
                </button>
                <button onClick={() => setManageOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--color-border)] transition-colors text-xs text-[var(--color-text-muted)]">
                  <Settings size={14} /> Customize
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
                {deletedWidgets.length > 0 ? 'All widgets are hidden or deleted.' : 'Your dashboard is empty.'}
              </div>
              <button onClick={() => setPickerOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors">
                <Plus size={16} /> Add widgets
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Grid overlay */}
              {gridOverlay && (
                <div className="absolute inset-0 z-0 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(rgba(215,179,106,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(215,179,106,0.04) 1px, transparent 1px)',
                  backgroundSize: `${100 / 12}% 72px`,
                }} />
              )}
              <DashboardGrid
                visibleWidgetIds={visibleWidgetIds}
                onHide={hideWidget}
                onDelete={deleteWidget}
                switchMode={switchMode}
                selectedId={selectedId}
                onWidgetClick={handleWidgetClick}
              />
            </div>
          )}
        </div>
      </main>

      {/* Control panel */}
      <GridControlPanel
        switchMode={switchMode}
        onToggleSwitch={() => { setSwitchMode(!switchMode); setSelectedId(null) }}
        onReset={resetLayout}
        onShuffle={shuffleLayout}
        onPreset={applyPreset}
        gridOverlay={gridOverlay}
        onToggleOverlay={() => setGridOverlay(!gridOverlay)}
        selectedId={selectedId}
        onWidgetSize={resizeWidget}
      />

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
