'use client'

import { X, Plus } from 'lucide-react'
import { WIDGET_REGISTRY } from '@/lib/widgetRegistry'

interface WidgetPickerProps {
  open: boolean
  onClose: () => void
  existingIds: Set<string>
  onAdd: (id: string) => void
}

export default function WidgetPicker({ open, onClose, existingIds, onAdd }: WidgetPickerProps) {
  if (!open) return null

  const available = WIDGET_REGISTRY.filter(w => !existingIds.has(w.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 max-h-[75vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Add Widget</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X size={15} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {available.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-8">All widgets are on your dashboard.</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {available.map(w => (
            <button
              key={w.id}
              onClick={() => { onAdd(w.id); onClose() }}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:bg-white/5 transition-colors text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white">{w.label}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {w.defaultCols}-col · {w.defaultHeight}
                </p>
              </div>
              <Plus size={13} className="shrink-0 text-[var(--color-accent)]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
