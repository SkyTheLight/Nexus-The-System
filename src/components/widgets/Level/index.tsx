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

  if (!mounted) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  const xpForCurrentLevel = Math.pow(level * 10, 2)
  const xpForNextLevel = Math.pow((level + 1) * 10, 2)
  const xpNeeded = xpForNextLevel - totalXp

  // Circular progress ring
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <svg width="120" height="120" className="-rotate-90">
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#1f2937"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Trophy size={24} className="text-yellow-500 mb-1" />
            <span className="text-2xl font-bold text-white">Level {level}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Total XP: {totalXp.toLocaleString()}</p>
      </div>

      <div className="space-y-3">
        <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, animatedProgress)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Star size={12} />
            {Math.round(animatedProgress)}%
          </span>
          <span>{xpNeeded.toLocaleString()} XP to next level</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <TrendingUp size={16} className="mx-auto mb-1 text-green-400" />
            <p className="text-xs text-gray-400">Streak</p>
            <p className="text-sm font-semibold text-white">7 days</p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <Trophy size={16} className="mx-auto mb-1 text-yellow-400" />
            <p className="text-xs text-gray-400">Rank</p>
            <p className="text-sm font-semibold text-white">
              {level >= 50 ? 'Master' : level >= 30 ? 'Expert' : level >= 15 ? 'Pro' : level >= 5 ? 'Novice' : 'Beginner'}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <Star size={16} className="mx-auto mb-1 text-blue-400" />
            <p className="text-xs text-gray-400">Next</p>
            <p className="text-sm font-semibold text-white">Lv {level + 1}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
