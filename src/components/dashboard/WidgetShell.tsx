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
      className="hud-card h-full flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false) }}
    >
      <div className="sl-scan" />

      {/* Drag bar */}
      <div className="widget-drag-bar flex items-center justify-between px-3 py-2 shrink-0 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-0.5 rounded hover:bg-[var(--sl-gold-dim)] transition-colors shrink-0">
            <GripVertical size={13} className="text-[var(--sl-gold)]" style={{ animation: hovered ? 'sl-mana-pulse 2s ease-in-out infinite' : 'none' }} />
          </div>
          <span className="text-[11px] font-['Cinzel'] font-semibold text-[var(--sl-gold)] uppercase tracking-wider truncate">
            {label}
          </span>
        </div>

        <div className={`flex items-center gap-0.5 transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={onHide} className="p-1 rounded hover:bg-[var(--sl-gold-dim)] transition-colors" title="Hide">
            <EyeOff size={11} className="text-[var(--sl-text-muted)]" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-[var(--sl-text-muted)] whitespace-nowrap">Remove?</span>
              <button onClick={onDelete} className="p-1 rounded hover:bg-[var(--sl-alert-dim)] transition-colors">
                <Check size={11} className="text-[var(--sl-alert)]" />
              </button>
              <button onClick={() => setConfirmDelete(false)} className="p-1 rounded hover:bg-[var(--sl-gold-dim)] transition-colors">
                <X size={11} className="text-[var(--sl-text-muted)]" />
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1 rounded hover:bg-[var(--sl-alert-dim)] transition-colors" title="Delete">
              <Trash2 size={11} className="text-[var(--sl-text-muted)]" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="widget-no-drag flex-1 overflow-y-auto p-3">
        {children}
      </div>
    </div>
  )
}
