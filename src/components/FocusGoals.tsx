'use client'

import { useState, useEffect } from 'react'
import { getGoals } from '@/lib/api'
import type { Goal } from '@/types'

export default function FocusGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoals()
    const interval = setInterval(loadGoals, 15000)
    return () => clearInterval(interval)
  }, [])

  async function loadGoals() {
    try {
      const data = await getGoals()
      setGoals(data.slice(0, 5))
    } catch {
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="widget-card min-h-[200px]">
        <div className="widget-card-header">
          <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-3 w-32 bg-white/5 rounded animate-pulse mb-2" />
              <div className="h-2 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="widget-card min-h-[200px]">
      <div className="widget-card-header">
        <span className="widget-card-title">Goals Progress</span>
        <span className="text-xs text-[var(--color-text-muted)]">{goals.filter(g => g.progress === 100).length}/{goals.length} done</span>
      </div>
      <div className="space-y-4 max-h-[320px] overflow-y-auto">
        {goals.length === 0 && (
          <div className="text-xs text-[var(--color-text-muted)] py-6 text-center">
            No goals set — Create one from the Goals page
          </div>
        )}
        {goals.map(goal => (
          <div key={goal.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-white truncate">{goal.title}</span>
              <span className="text-xs text-[var(--color-text-muted)] shrink-0 ml-2">{goal.progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  goal.progress === 100 ? 'bg-[var(--color-green)]' : 'bg-[var(--color-accent)]'
                }`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            {goal.description && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">{goal.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
