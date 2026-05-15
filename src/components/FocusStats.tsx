'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Target, Zap, FileText } from 'lucide-react'
import { getTasks, getGoals, getNotes } from '@/lib/api'
import { useFocusTimer } from '@/lib/focusTimer'

interface Stats {
  tasksDoneToday: number
  activeGoals: number
  streak: number
  notesThisWeek: number
}

export default function FocusStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadStats() {
    try {
      const [tasks, goals, notes] = await Promise.all([
        getTasks(),
        getGoals(),
        getNotes()
      ])

      const today = new Date().toISOString().split('T')[0]
      const tasksDoneToday = tasks.filter(t => t.status === 'done').length

      const activeGoals = goals.filter(g => g.progress > 0 && g.progress < 100).length

      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const notesThisWeek = notes.filter(n => n.created_at >= weekStartStr).length

      let streak = 0
      const d = new Date()
      for (let i = 0; i < 365; i++) {
        const dateStr = d.toISOString().split('T')[0]
        const hasActivity = tasks.some(t => t.status === 'done' && t.updated_at?.startsWith(dateStr))
        if (hasActivity) {
          streak++
          d.setDate(d.getDate() - 1)
        } else {
          break
        }
      }

      setStats({ tasksDoneToday, activeGoals, streak, notesThisWeek })
    } catch {
      setStats({ tasksDoneToday: 0, activeGoals: 0, streak: 0, notesThisWeek: 0 })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="widget-card min-h-[80px] animate-pulse">
            <div className="h-3 w-20 bg-white/5 rounded mb-3" />
            <div className="h-6 w-12 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'TASKS DONE TODAY', value: stats.tasksDoneToday, icon: CheckCircle2, color: 'var(--color-green)' },
    { label: 'ACTIVE GOALS', value: stats.activeGoals, icon: Target, color: 'var(--color-purple)' },
    { label: 'DAY STREAK', value: stats.streak, icon: Zap, color: 'var(--color-orange)' },
    { label: 'NOTES THIS WEEK', value: stats.notesThisWeek, icon: FileText, color: 'var(--color-accent)' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div key={card.label} className="widget-card min-h-[80px]" style={{ borderTop: `2px solid ${card.color}` }}>
            <div className="widget-card-header">
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color: card.color }} />
                <span className="stat-card-label">{card.label}</span>
              </div>
            </div>
            <div className="stat-card-number">{card.value}</div>
          </div>
        )
      })}
    </div>
  )
}
