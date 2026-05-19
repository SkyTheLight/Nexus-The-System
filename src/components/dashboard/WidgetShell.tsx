'use client'

import { useState } from 'react'

interface WidgetShellProps {
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

      <div className="widget-drag-bar flex items-center gap-2 px-4 py-1.5 border-b border-[rgba(215,179,106,0.12)] shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--sl-gold)]/40" />
        <span className="text-[clamp(9px,1.5cqw,12px)] font-mono text-[var(--sl-text-muted)] uppercase tracking-[0.2em]">{label}</span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={onHide}
            className={`text-[9px] font-mono text-[var(--sl-text-dim)] hover:text-[var(--sl-gold)] transition-colors uppercase tracking-[0.15em] ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            HIDE
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-[var(--sl-text-dim)]">DEL?</span>
              <button onClick={onDelete} className="text-[9px] font-mono text-[var(--sl-alert)] hover:text-[var(--sl-alert-dim)] transition-colors">[OK]</button>
              <button onClick={() => setConfirmDelete(false)} className="text-[9px] font-mono text-[var(--sl-text-dim)] hover:text-[var(--sl-gold)] transition-colors">[X]</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className={`text-[9px] font-mono text-[var(--sl-text-dim)] hover:text-[var(--sl-alert)] transition-colors uppercase tracking-[0.15em] ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              DEL
            </button>
          )}
        </div>
      </div>

      <div className="widget-no-drag flex-1 p-4 overflow-auto">
        {children}
      </div>
    </div>
  )
}
