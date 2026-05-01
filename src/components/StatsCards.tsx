'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle2, Target, TrendingUp } from 'lucide-react'

export default function StatsCards() {
  const [stats, setStats] = useState({
    focusHoursToday: 0,
    tasksDoneToday: 0,
    goalsHitWeek: '0/0',
  })

  useEffect(() => {
    loadStats()
    // Reload every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = () => {
    // Load focus hours from localStorage (Pomodoro sessions)
    const today = new Date().toISOString().split('T')[0]
    const focusSessions = JSON.parse(localStorage.getItem('focus-sessions') || '[]')
    const todaySessions = focusSessions.filter((s: any) => s.date === today)
    const focusHours = todaySessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) / 3600

    // Load tasks completed today
    const todos = JSON.parse(localStorage.getItem('adversity-todos') || '[]')
    const tasksToday = todos.filter((t: any) => {
      if (!t.completed || !t.completed_at) return false
      return t.completed_at.startsWith(today)
    }).length

    // Load goals hit this week
    const goals = JSON.parse(localStorage.getItem('adversity-goals') || '[]')
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]
    const goalsHit = goals.filter((g: any) => {
      if (!g.completed || !g.completed_at) return false
      return g.completed_at >= weekStartStr
    }).length
    const totalGoals = goals.length

    setStats({
      focusHoursToday: Math.round(focusHours * 100) / 100,
      tasksDoneToday: tasksToday,
      goalsHitWeek: `${goalsHit}/${totalGoals}`,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 animate-[fadeIn_0.3s_ease-out] hover:border-[var(--primary)]/50 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={16} className="text-[var(--primary)]" />
          <span className="text-xs text-[var(--text-muted)]">Focus Hours Today</span>
        </div>
        <div className="text-2xl font-bold text-[var(--text)]">
          {stats.focusHoursToday}h
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 animate-[fadeIn_0.3s_ease-out_0.1s] hover:border-[var(--primary)]/50 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={16} className="text-green-400" />
          <span className="text-xs text-[var(--text-muted)]">Tasks Done Today</span>
        </div>
        <div className="text-2xl font-bold text-[var(--text)]">
          {stats.tasksDoneToday} tasks
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 animate-[fadeIn_0.3s_ease-out_0.2s] hover:border-[var(--primary)]/50 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} className="text-[var(--accent)]" />
          <span className="text-xs text-[var(--text-muted)]">Goals Hit This Week</span>
        </div>
        <div className="text-2xl font-bold text-[var(--text)]">
          {stats.goalsHitWeek}
        </div>
      </div>
    </div>
  )
}
