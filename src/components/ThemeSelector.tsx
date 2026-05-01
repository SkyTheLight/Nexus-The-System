'use client'

import { useState } from 'react'
import { themes, applyTheme, initTheme } from '@/lib/themes'
import { Check } from 'lucide-react'

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('adversity-theme') || 'default-dark'
  )

  const handleThemeChange = (themeId: string) => {
    applyTheme(themeId)
    setCurrentTheme(themeId)
    setIsOpen(false)
  }

  const current = themes.find(t => t.id === currentTheme) || themes[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all duration-300"
        title="Change Theme"
      >
        <span className="text-lg">{current.emoji}</span>
        <span className="text-xs text-[var(--text-muted)]">{current.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="p-3 border-b border-[var(--border)]">
            <h4 className="text-sm font-medium text-[var(--text)]">Select Theme</h4>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--primary)]/10 transition-colors duration-200 ${
                  currentTheme === theme.id ? 'bg-[var(--primary)]/20' : ''
                }`}
              >
                <span className="text-2xl">{theme.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--text)]">{theme.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{theme.description}</div>
                </div>
                {currentTheme === theme.id && (
                  <Check size={16} className="text-[var(--primary)]" />
                )}
                {/* Color preview */}
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ background: theme.variables['--primary'] }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ background: theme.variables['--accent'] }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
