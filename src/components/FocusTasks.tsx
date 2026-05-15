'use client'

import { useState, useEffect } from 'react'
import { getTasks, updateTask } from '@/lib/api'
import type { Task } from '@/types'
import { Circle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { addXpGlobal } from '@/hooks/useXp'

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export default function FocusTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
    const interval = setInterval(loadTasks, 10000)
    return () => clearInterval(interval)
  }, [])

  async function loadTasks() {
    try {
      const data = await getTasks()
      const today = new Date().toISOString().split('T')[0]
      const sorted = [...data].sort((a, b) => {
        const aDue = a.due_date?.startsWith(today) ? 0 : 1
        const bDue = b.due_date?.startsWith(today) ? 0 : 1
        if (aDue !== bDue) return aDue - bDue
        if (a.status === 'done' && b.status !== 'done') return 1
        if (a.status !== 'done' && b.status === 'done') return -1
        return 0
      })
      setTasks(sorted.slice(0, 8))
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      await updateTask(task.id, { status: newStatus })
      if (newStatus === 'done') addXpGlobal(20)
      loadTasks()
    } catch {}
  }

  if (loading) {
    return (
      <div className="widget-card min-h-[200px]">
        <div className="widget-card-header">
          <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-white/5 animate-pulse" />
              <div className="h-3 flex-1 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const incomplete = tasks.filter(t => t.status !== 'done')
  const completed = tasks.filter(t => t.status === 'done')

  return (
    <div className="widget-card min-h-[200px]">
      <div className="widget-card-header">
        <span className="widget-card-title">Today's Tasks</span>
        <span className="text-xs text-[var(--color-text-muted)]">{incomplete.length} remaining</span>
      </div>
      <div className="space-y-1 max-h-[320px] overflow-y-auto">
        {tasks.length === 0 && (
          <div className="text-xs text-[var(--color-text-muted)] py-6 text-center">
            No tasks yet — Add one from the To-Do page
          </div>
        )}
        {tasks.map(task => {
          const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0] && task.status !== 'done'
          return (
            <div
              key={task.id}
              className="flex items-center gap-2.5 py-2 px-1 rounded hover:bg-white/5 transition-colors group cursor-pointer"
              onClick={() => toggleTask(task)}
            >
              {task.status === 'done' ? (
                <CheckCircle2 size={16} className="text-[var(--color-green)] shrink-0" />
              ) : (
                <Circle size={16} className="text-[var(--color-text-muted)] shrink-0 group-hover:text-[var(--color-accent)]" />
              )}
              <span className={`text-sm flex-1 truncate ${task.status === 'done' ? 'line-through text-[var(--color-text-muted)]' : 'text-white'}`}>
                {task.title}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {task.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded border bg-white/5 text-[var(--color-text-muted)] border-white/10">
                    {tag}
                  </span>
                ))}
                {task.priority && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[task.priority] || priorityColors.low}`}>
                    {task.priority}
                  </span>
                )}
                {isOverdue && <AlertTriangle size={12} className="text-red-400" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
