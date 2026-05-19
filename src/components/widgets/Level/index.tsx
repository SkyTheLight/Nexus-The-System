'use client'

import { useState, useEffect } from 'react'
import { Trophy, Star, TrendingUp } from 'lucide-react'
import { useXp } from '@/hooks/useXp'

export default function LevelWidget() {
  const { totalXp, level, progress } = useXp()
  const [mounted, setMounted] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100)
      return () => clearTimeout(timer)
    }
  }, [progress, mounted])

  if (!mounted) return <div className="text-[var(--sl-text-muted)] text-sm p-4">Loading...</div>

  const xpForCurrentLevel = Math.pow(level * 10, 2)
  const xpForNextLevel = Math.pow((level + 1) * 10, 2)
  const xpNeeded = xpForNextLevel - totalXp

  // Circular progress ring
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  const getRank = () => {
    if (level >= 50) return 'NATIONAL LEVEL'
    if (level >= 30) return 'S-RANK'
    if (level >= 15) return 'A-RANK'
    if (level >= 5)  return 'B-RANK'
    return 'E-RANK'
  }

  return (
    <div className="h-full flex flex-col justify-center">
      {/* Level ring */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <svg width="120" height="120" className="-rotate-90">
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="url(#slProgressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{ filter: 'drop-shadow(0 0 6px #d7b36a)' }}
            />
            <defs>
              <linearGradient id="slProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d7b36a" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Trophy size={24} className="text-[var(--sl-gold)] mb-1" />
            <span className="text-2xl font-['Bebas_Neue'] font-bold text-[var(--sl-gold)]">Level {level}</span>
          </div>
        </div>
        <p className="text-[10px] font-mono text-[var(--sl-text-muted)] mt-2 uppercase tracking-wider">Total XP: {totalXp.toLocaleString()}</p>
      </div>

      {/* XP bar */}
      <div className="space-y-3">
        <div className="relative w-full h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(100, animatedProgress)}%`,
              background: 'linear-gradient(90deg, #d7b36a, #7c3aed)',
              boxShadow: '0 0 8px rgba(215, 179, 106, 0.4)',
              animation: 'sl-mana-pulse 2s ease-in-out infinite',
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--sl-text-muted)] uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-[var(--sl-gold)]" />
            {Math.round(animatedProgress)}%
          </span>
          <span>{xpNeeded.toLocaleString()} XP to next level</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-2 bg-[var(--sl-surface-2)] rounded border border-[var(--sl-border)]">
            <TrendingUp size={16} className="mx-auto mb-1 text-[var(--sl-gold)]" />
            <p className="text-[9px] font-mono text-[var(--sl-text-muted)] uppercase tracking-wider">Streak</p>
            <p className="text-sm font-['Bebas_Neue'] text-[var(--sl-text)]">7 days</p>
          </div>
          <div className="text-center p-2 bg-[var(--sl-surface-2)] rounded border border-[var(--sl-border)]">
            <Trophy size={16} className="mx-auto mb-1 text-[var(--sl-gold)]" />
            <p className="text-[9px] font-mono text-[var(--sl-text-muted)] uppercase tracking-wider">Rank</p>
            <p className="text-sm font-['Cinzel'] font-semibold text-[var(--sl-gold)]">{getRank()}</p>
          </div>
          <div className="text-center p-2 bg-[var(--sl-surface-2)] rounded border border-[var(--sl-border)]">
            <Star size={16} className="mx-auto mb-1 text-[var(--sl-gold)]" />
            <p className="text-[9px] font-mono text-[var(--sl-text-muted)] uppercase tracking-wider">Next</p>
            <p className="text-sm font-['Bebas_Neue'] text-[var(--sl-text)]">Lv {level + 1}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
