'use client'

import { useState, useEffect } from 'react'
import { getTasks } from '@/lib/api'
import type { Task } from '@/types'

interface DayData {
  label: string
  count: number
}

export default function FocusWeeklyChart() {
  const [days, setDays] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const tasks = await getTasks()
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const today = new Date()
      const dayOfWeek = today.getDay()

      const dayMap = new Map<string, number>()
      dayNames.forEach(d => dayMap.set(d, 0))

      tasks.filter(t => t.status === 'done').forEach(t => {
        if (!t.updated_at) return
        const d = new Date(t.updated_at)
        const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays >= 0 && diffDays <= dayOfWeek) {
          const label = dayNames[d.getDay()]
          dayMap.set(label, (dayMap.get(label) || 0) + 1)
        }
      })

      const result: DayData[] = []
      for (let i = 0; i < 7; i++) {
        const idx = (dayOfWeek - 6 + i + 7) % 7
        const label = dayNames[idx]
        result.push({ label, count: dayMap.get(label) || 0 })
      }

      setDays(result)
    } catch {
      setDays([])
    } finally {
      setLoading(false)
    }
  }

  const maxCount = Math.max(...days.map(d => d.count), 1)

  if (loading) {
    return (
      <div className="widget-card min-h-[120px]">
        <div className="widget-card-header">
          <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex items-end gap-2 h-20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 bg-white/5 rounded animate-pulse" style={{ height: `${30 + Math.random() * 50}px` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="widget-card min-h-[120px]">
      <div className="widget-card-header">
        <span className="widget-card-title">Tasks Completed This Week</span>
      </div>
      <div className="flex items-end gap-2 h-20 pt-2">
        {days.map(day => {
          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          return (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[var(--color-text-muted)]">{day.count}</span>
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height: `${Math.max(height * 0.7, 4)}px`,
                  backgroundColor: day.count > 0 ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)'
                }}
              />
              <span className="text-[10px] text-[var(--color-text-muted)]">{day.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
