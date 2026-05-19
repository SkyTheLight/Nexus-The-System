'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import LiquidBackground from '@/components/LiquidBackground'
import DashboardGrid from '@/components/dashboard/DashboardGrid'
import ManageWidgetsPanel from '@/components/dashboard/ManageWidgetsPanel'
import WidgetPicker from '@/components/dashboard/WidgetPicker'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'
import { Settings, Plus } from 'lucide-react'

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
  const [initialized, setInitialized]  = useState(false)
  const [hiddenSet,   setHiddenSet]    = useState<Set<string>>(new Set())
  const [deletedSet,  setDeletedSet]   = useState<Set<string>>(new Set())
  const [manageOpen,  setManageOpen]   = useState(false)
  const [pickerOpen,  setPickerOpen]   = useState(false)

  useEffect(() => {
    setHiddenSet(loadSet(HIDDEN_KEY))
    setDeletedSet(loadSet(DELETED_KEY))
    setInitialized(true)
  }, [])

  const allIds = useMemo(() => WIDGET_REGISTRY.map(w => w.id), [])
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

  if (!initialized) return (
    <div className="flex h-screen items-center justify-center bg-[#06060a]">
      <div className="text-[var(--sl-gold)] font-mono text-xs tracking-widest uppercase animate-pulse">
        ◈ System Initializing...
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" data-theme="solo-leveling">
      <LiquidBackground />
      <Sidebar />

      <main className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ${sidebarOpen ? 'ml-[220px]' : 'ml-[56px]'}`}>
        <TopNav />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--sl-border)]">
          <div>
            <h1 className="text-base font-['Cinzel'] font-semibold text-[var(--sl-gold)] tracking-widest uppercase">
              ◈ Focus Board
            </h1>
            <p className="text-[10px] font-mono text-[var(--sl-text-muted)] tracking-wider uppercase mt-0.5">
              Personal Command Center — Active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-[var(--sl-border)] text-[var(--sl-text-muted)] hover:text-[var(--sl-gold)] hover:border-[var(--sl-border-hov)] transition-all"
            >
              <Plus size={12} /> Add Widget
            </button>
            <button
              onClick={() => setManageOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-[var(--sl-border)] text-[var(--sl-text-muted)] hover:text-[var(--sl-gold)] hover:border-[var(--sl-border-hov)] transition-all"
            >
              <Settings size={12} /> Customize
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {visibleWidgetIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-xs font-mono text-[var(--sl-text-muted)] uppercase tracking-widest">
                No active widgets in the System
              </p>
              <button
                onClick={() => setPickerOpen(true)}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-[var(--sl-gold)] text-[var(--sl-gold)] hover:bg-[var(--sl-gold-dim)] transition-all"
              >
                ◈ Deploy Widgets
              </button>
            </div>
          ) : (
            <DashboardGrid
              visibleWidgetIds={visibleWidgetIds}
              onHide={hideWidget}
              onDelete={deleteWidget}
            />
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
