'use client'

import { useState, useEffect } from 'react'
import { Calendar, Trash2 } from 'lucide-react'
import { getTasks, getGoals, getCertificates } from '@/lib/api'
import type { Task, Goal, Certificate } from '@/types'

interface TimelineEvent {
  id: string
  title: string
  date: string
  type: 'task' | 'goal' | 'certificate'
  status: string
}

export default function TimelineWidget() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [])

  async function loadTimeline() {
    try {
      const [tasks, goals, certs] = await Promise.all([
        getTasks(),
        getGoals(),
        getCertificates()
      ])

       const timelineEvents: TimelineEvent[] = [
        ...tasks
          .filter((t: any) => t.deadline)
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            date: t.deadline,
            type: 'task' as const,
            status: t.status
          })),
        ...goals
          .filter((g: any) => g.deadline)
          .map((g: any) => ({
            id: g.id,
            title: g.title,
            date: g.deadline,
            type: 'goal' as const,
            status: g.type
          })),
        ...certs
          .filter((c: any) => c.deadline)
          .map((c: any) => ({
            id: c.id,
            title: c.title,
            date: c.deadline,
            type: 'certificate' as const,
            status: c.status
          }))
      ]

      // Sort by date
      timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setEvents(timelineEvents)
    } catch (error) {
      console.error('Error loading timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const getColor = (type: string) => {
    switch(type) {
      case 'task': return 'bg-blue-500'
      case 'goal': return 'bg-purple-500'
      case 'certificate': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Timeline</h3>
        <Calendar size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {events.length === 0 ? (
          <div className="text-xs text-muted-foreground">No upcoming deadlines</div>
        ) : (
          events.map(event => (
            <div key={`${event.type}-${event.id}`} className="group flex items-start gap-2 p-2 hover:bg-accent rounded">
              <div className={`w-1.5 h-1.5 rounded-full ${getColor(event.type)} shrink-0 mt-1.5`} />
              <div className="flex-1">
                <div className="text-xs font-medium">{event.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' · '}{event.type}
                </div>
              </div>
              <button
                onClick={() => removeEvent(event.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
