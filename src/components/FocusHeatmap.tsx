'use client'

import { useState, useEffect } from 'react'
import { getTasks } from '@/lib/api'
import type { Task } from '@/types'

export default function FocusHeatmap() {
  const [days, setDays] = useState<{ date: string; level: 0 | 1 | 2 | 3 }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const tasks = await getTasks()
      const dayMap = new Map<string, number>()

      for (let i = 27; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        dayMap.set(key, 0)
      }

      tasks.filter(t => t.status === 'done').forEach(t => {
        const dateKey = t.updated_at?.split('T')[0]
        if (dateKey && dayMap.has(dateKey)) {
          dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1)
        }
      })

      const result = Array.from(dayMap.entries()).map(([date, count]) => ({
        date,
        level: (count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : 3) as 0 | 1 | 2 | 3
      }))

      setDays(result)
    } catch {
      setDays([])
    } finally {
      setLoading(false)
    }
  }

  const levelColors = [
    'bg-white/5',
    'bg-[var(--color-green)]/30',
    'bg-[var(--color-green)]/60',
    'bg-[var(--color-green)]'
  ]

  const monthLabels: { label: string; index: number }[] = []
  const seenMonths = new Set<string>()
  days.forEach((day, i) => {
    const month = new Date(day.date).toLocaleString('en', { month: 'short' })
    if (!seenMonths.has(month)) {
      seenMonths.add(month)
      monthLabels.push({ label: month, index: i })
    }
  })

  if (loading) {
    return (
      <div className="widget-card min-h-[120px]">
        <div className="widget-card-header">
          <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="widget-card min-h-[120px]">
      <div className="widget-card-header">
        <span className="widget-card-title">Activity (28 days)</span>
        <div className="flex items-center gap-1.5">
          {levelColors.map((color, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-sm ${color}`} />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {days.map(day => (
          <div
            key={day.date}
            className={`w-3 h-3 rounded-sm ${levelColors[day.level]} transition-colors`}
            title={`${day.date}: ${day.level > 0 ? `${day.level} task${day.level > 1 ? 's' : ''}` : 'no activity'}`}
          />
        ))}
      </div>
    </div>
  )
}
