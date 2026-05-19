'use client'

import { useState, useCallback } from 'react'
import {
  Shuffle,
  RotateCcw,
  Grid3X3,
  LayoutGrid,
  LayoutList,
  Move,
  X,
  Minimize2,
  Maximize2,
  Columns2,
  Rows2,
} from 'lucide-react'

interface GridControlPanelProps {
  switchMode: boolean
  onToggleSwitch: () => void
  onReset: () => void
  onShuffle: () => void
  onPreset: (preset: 'compact' | 'balanced' | 'spacious') => void
  gridOverlay: boolean
  onToggleOverlay: () => void
  selectedId: string | null
  onWidgetSize: (id: string, size: 'small' | 'medium' | 'large' | 'wide') => void
  onClose?: () => void
}

export default function GridControlPanel({
  switchMode,
  onToggleSwitch,
  onReset,
  onShuffle,
  onPreset,
  gridOverlay,
  onToggleOverlay,
  selectedId,
  onWidgetSize,
  onClose,
}: GridControlPanelProps) {
  const [showPresets, setShowPresets] = useState(false)
  const [showSizes, setShowSizes] = useState(false)

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[sl-fade-in_300ms_ease-out]">
      <div className="bg-[#0b0b13]/95 backdrop-blur-xl border border-[var(--sl-border)] rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--sl-border)]">
          <span className="text-[9px] font-mono text-[var(--sl-gold)] uppercase tracking-[0.25em]">
            ◈ Grid Control
          </span>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-[var(--sl-gold-dim)] rounded transition-colors">
              <X size={12} className="text-[var(--sl-text-muted)]" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 p-2">
          {/* Switch Mode */}
          <button
            onClick={onToggleSwitch}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
              switchMode
                ? 'bg-[var(--sl-gold)]/20 border border-[var(--sl-gold)]/40 text-[var(--sl-gold)]'
                : 'bg-white/5 border border-transparent text-[var(--sl-text-muted)] hover:text-[var(--sl-gold)] hover:border-[var(--sl-border)]'
            }`}
          >
            <Move size={12} />
            Switch
          </button>

          {/* Presets */}
          <div className="relative">
            <button
              onClick={() => { setShowPresets(!showPresets); setShowSizes(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-transparent text-[var(--sl-text-muted)] hover:text-[var(--sl-gold)] hover:border-[var(--sl-border)] transition-all"
            >
              <LayoutGrid size={12} />
              Presets
            </button>
            {showPresets && (
              <div className="absolute bottom-full left-0 mb-2 bg-[#0b0b13]/95 backdrop-blur-xl border border-[var(--sl-border)] rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                {[
                  { key: 'compact' as const, icon: Minimize2, label: 'Compact' },
                  { key: 'balanced' as const, icon: LayoutGrid, label: 'Balanced' },
                  { key: 'spacious' as const, icon: Maximize2, label: 'Spacious' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => { onPreset(key); setShowPresets(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--sl-text-muted)] hover:bg-[var(--sl-gold-dim)] hover:text-[var(--sl-gold)] transition-all"
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Widget Size (when selected) */}
          {selectedId && (
            <div className="relative">
              <button
                onClick={() => { setShowSizes(!showSizes); setShowPresets(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-[var(--sl-gold)]/10 border border-[var(--sl-gold)]/30 text-[var(--sl-gold)] hover:bg-[var(--sl-gold)]/20 transition-all"
              >
                <Columns2 size={12} />
                Resize
              </button>
              {showSizes && (
                <div className="absolute bottom-full left-0 mb-2 bg-[#0b0b13]/95 backdrop-blur-xl border border-[var(--sl-border)] rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                  {[
                    { key: 'small' as const, icon: Minimize2, label: 'Small (3×3)' },
                    { key: 'medium' as const, icon: LayoutGrid, label: 'Medium (4×5)' },
                    { key: 'large' as const, icon: Maximize2, label: 'Large (6×7)' },
                    { key: 'wide' as const, icon: Columns2, label: 'Wide (12×4)' },
                  ].map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => { onWidgetSize(selectedId, key); setShowSizes(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--sl-text-muted)] hover:bg-[var(--sl-gold-dim)] hover:text-[var(--sl-gold)] transition-all"
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shuffle */}
          <button
            onClick={onShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-transparent text-[var(--sl-text-muted)] hover:text-[var(--sl-gold)] hover:border-[var(--sl-border)] transition-all"
          >
            <Shuffle size={12} />
            Shuffle
          </button>

          {/* Grid Overlay */}
          <button
            onClick={onToggleOverlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
              gridOverlay
                ? 'bg-[var(--sl-mana)]/20 border border-[var(--sl-mana)]/40 text-[var(--sl-mana)]'
                : 'bg-white/5 border border-transparent text-[var(--sl-text-muted)] hover:text-[var(--sl-gold)] hover:border-[var(--sl-border)]'
            }`}
          >
            <Grid3X3 size={12} />
            Grid
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-transparent text-[var(--sl-text-muted)] hover:text-[var(--sl-alert)] hover:border-[var(--sl-alert-dim)] transition-all"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
