'use client'

import { useState } from 'react'
import { Minus, X } from 'lucide-react'

interface WidgetShellProps {
  label: string
  onHide: () => void
  onDelete: () => void
  children: React.ReactNode
}

export default function WidgetShell({ label, onHide, onDelete, children }: WidgetShellProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="hud-card h-full flex flex-col">
      <div className="sl-scan" />

      {/* Window title bar */}
      <div className="widget-drag-bar flex items-center gap-2 px-3 py-1.5 shrink-0">
        {/* macOS-style window controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setConfirmDelete(prev => !prev)}
            className="group relative w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-400 hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
          >
            <X size={8} className="text-black font-bold opacity-0 group-hover:opacity-100" />
          </button>
          <button
            onClick={onHide}
            className="group relative w-3 h-3 rounded-full bg-yellow-500/60 hover:bg-yellow-400 hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
          >
            <Minus size={8} className="text-black font-bold opacity-0 group-hover:opacity-100" />
          </button>
          <div className="w-3 h-3 rounded-full bg-green-500/30" />
        </div>

        {/* Widget label — centered */}
        <span className="flex-1 text-center text-[clamp(9px,1.5cqw,12px)] font-mono text-[var(--sl-text-muted)] uppercase tracking-[0.2em]">
          {label}
        </span>

        {/* Delete confirmation */}
        <div className="w-20 flex justify-end">
          {confirmDelete && (
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[var(--sl-text-dim)]">DEL?</span>
              <button
                onClick={onDelete}
                className="text-[9px] font-mono text-[var(--sl-alert)] hover:text-[var(--sl-alert-dim)] transition-colors"
              >
                [OK]
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[9px] font-mono text-[var(--sl-text-dim)] hover:text-[var(--sl-gold)] transition-colors"
              >
                [X]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="widget-no-drag flex-1 p-4 overflow-auto">
        {children}
      </div>
    </div>
  )
}
