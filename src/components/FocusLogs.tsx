'use client'

import { useState, useEffect } from 'react'
import { getLogs, type LogItem } from '@/lib/logs'
import { Trash2, Target, Lightbulb, FileText, Music, Award, Code, Gamepad2, CheckSquare } from 'lucide-react'

const typeIcons: Record<string, any> = {
  task: CheckSquare,
  goal: Target,
  idea: Lightbulb,
  note: FileText,
  music: Music,
  certificate: Award,
  dev: Code,
  performance: Gamepad2,
  assignment: CheckSquare,
}

const typeColors: Record<string, string> = {
  task: 'var(--color-green)',
  goal: 'var(--color-purple)',
  idea: 'var(--color-orange)',
  note: 'var(--color-accent)',
  music: 'var(--color-purple)',
  certificate: 'var(--color-green)',
  dev: 'var(--color-accent)',
  performance: 'var(--color-orange)',
  assignment: 'var(--color-orange)',
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function FocusLogs() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    try {
      const data = await getLogs()
      setLogs(data.slice(0, 3))
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="widget-card min-h-[120px]">
        <div className="widget-card-header">
          <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/5 animate-pulse" />
              <div className="h-3 flex-1 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="widget-card min-h-[120px]">
      <div className="widget-card-header">
        <span className="widget-card-title">Recent Activity</span>
      </div>
      <div className="space-y-2">
        {logs.length === 0 && (
          <div className="text-xs text-[var(--color-text-muted)] py-4 text-center">
            No activity logged yet
          </div>
        )}
        {logs.map(log => {
          const Icon = typeIcons[log.type] || Trash2
          const color = typeColors[log.type] || 'var(--color-text-muted)'
          return (
            <div key={log.id} className="flex items-start gap-2.5 py-1.5">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white truncate">
                  {log.type === 'task' ? 'Completed' : 'Deleted'} {log.type}
                  {log.title ? `: ${log.title}` : ''}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {log.deleted_at ? timeAgo(log.deleted_at) : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
