'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle2, Target } from 'lucide-react'

export default function StatsCards() {
  const [stats, setStats] = useState({
    focusHoursToday: 0,
    tasksDoneToday: 0,
    goalsHitWeek: '0/0',
  })

  useEffect(() => {
    loadStats()
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
      <div className="widget-card stat-card-focus min-h-[90px]">
        <div className="widget-card-header">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#00d4ff]" />
            <span className="stat-card-label">FOCUS HOURS TODAY</span>
          </div>
        </div>
        <div className="stat-card-number">{stats.focusHoursToday}h</div>
      </div>

      <div className="widget-card stat-card-tasks min-h-[90px]">
        <div className="widget-card-header">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#22c55e]" />
            <span className="stat-card-label">TASKS DONE TODAY</span>
          </div>
        </div>
        <div className="stat-card-number">{stats.tasksDoneToday} tasks</div>
      </div>

      <div className="widget-card stat-card-goals min-h-[90px]">
        <div className="widget-card-header">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#a855f7]" />
            <span className="stat-card-label">GOALS HIT THIS WEEK</span>
          </div>
        </div>
        <div className="stat-card-number">{stats.goalsHitWeek}</div>
      </div>
    </div>
  )
}
