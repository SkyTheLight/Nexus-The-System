'use client'

import { X, Eye, EyeOff, RotateCcw, Plus } from 'lucide-react'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'

interface ManageWidgetsPanelProps {
  open: boolean
  onClose: () => void
  visibleWidgets: string[]
  hiddenWidgets: string[]
  deletedWidgets: string[]
  onShow: (id: string) => void
  onHide: (id: string) => void
  onRestore: (id: string) => void
  onAddNew: () => void
}

export default function ManageWidgetsPanel({
  open, onClose, visibleWidgets, hiddenWidgets, deletedWidgets,
  onShow, onHide, onRestore, onAddNew,
}: ManageWidgetsPanelProps) {
  if (!open) return null

  const renderList = (ids: string[], type: 'visible' | 'hidden' | 'deleted') => (
    <div className="space-y-0.5">
      {WIDGET_REGISTRY.filter(w => ids.includes(w.id)).map(w => (
        <div key={w.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 transition-colors">
          <span className={`text-xs ${type === 'deleted' ? 'text-[var(--color-text-muted)] line-through' : type === 'hidden' ? 'text-[var(--color-text-muted)]' : 'text-white'}`}>
            {w.label}
          </span>
          <div className="flex items-center gap-1">
            {type === 'visible' && (
              <button onClick={() => onHide(w.id)} className="p-1 rounded hover:bg-white/10 transition-colors" title="Hide">
                <EyeOff size={11} className="text-[var(--color-text-muted)]" />
              </button>
            )}
            {type === 'hidden' && (
              <button onClick={() => onShow(w.id)} className="p-1 rounded hover:bg-white/10 transition-colors" title="Show">
                <Eye size={11} className="text-[var(--color-accent)]" />
              </button>
            )}
            {type === 'deleted' && (
              <button onClick={() => onRestore(w.id)} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors" title="Restore">
                <RotateCcw size={10} className="text-[var(--color-text-muted)]" />
                <span className="text-[9px] text-[var(--color-text-muted)]">Restore</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-72 max-w-full bg-[var(--color-surface)] border-l border-[var(--color-border)] h-full overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Manage Widgets</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X size={15} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <button
          onClick={onAddNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)] transition-colors mb-5"
        >
          <Plus size={13} />
          Add Widget
        </button>

        {visibleWidgets.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 font-medium">Visible ({visibleWidgets.length})</h3>
            {renderList(visibleWidgets, 'visible')}
          </div>
        )}

        {hiddenWidgets.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 font-medium">Hidden ({hiddenWidgets.length})</h3>
            {renderList(hiddenWidgets, 'hidden')}
          </div>
        )}

        {deletedWidgets.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 font-medium">Deleted ({deletedWidgets.length})</h3>
            {renderList(deletedWidgets, 'deleted')}
          </div>
        )}

        {visibleWidgets.length === 0 && hiddenWidgets.length === 0 && deletedWidgets.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-8">No widgets configured.</p>
        )}
      </div>
    </div>
  )
}
