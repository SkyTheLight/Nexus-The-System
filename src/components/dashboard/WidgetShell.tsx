'use client'

import { useState } from 'react'
import { GripVertical, EyeOff, Trash2, X, Check } from 'lucide-react'

interface WidgetShellProps {
  id: string
  label: string
  onHide: () => void
  onDelete: () => void
  children: React.ReactNode
}

export default function WidgetShell({ label, onHide, onDelete, children }: WidgetShellProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex flex-col h-full overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false) }}
    >
      <div className="widget-drag-bar flex items-center justify-between px-3 py-2 border-b border-white/5 shrink-0 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-0.5 rounded hover:bg-white/10 transition-colors shrink-0">
            <GripVertical size={13} className="text-[var(--color-text-muted)]" />
          </div>
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider truncate">
            {label}
          </span>
        </div>

        <div className={`flex items-center gap-0.5 transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={onHide} className="p-1 rounded hover:bg-white/10 transition-colors" title="Hide">
            <EyeOff size={11} className="text-[var(--color-text-muted)]" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-[var(--color-text-muted)] whitespace-nowrap">Remove?</span>
              <button onClick={onDelete} className="p-1 rounded hover:bg-red-500/20 transition-colors">
                <Check size={11} className="text-red-400" />
              </button>
              <button onClick={() => setConfirmDelete(false)} className="p-1 rounded hover:bg-white/10 transition-colors">
                <X size={11} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1 rounded hover:bg-red-500/20 transition-colors" title="Delete">
              <Trash2 size={11} className="text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>
      </div>

      <div className="widget-no-drag flex-1 overflow-y-auto p-3">
        {children}
      </div>
    </div>
  )
}
