'use client'

import { Calendar, CheckCircle2, Circle } from 'lucide-react'

export default function TimelineView() {
  const events = [
    { id: '1', title: 'Start TypeScript Course', date: '2026-04-01', status: 'completed' },
    { id: '2', title: 'MVP Development', date: '2026-04-15', status: 'in-progress' },
    { id: '3', title: 'AWS Certification Exam', date: '2026-06-01', status: 'upcoming' },
    { id: '4', title: 'Product Launch', date: '2026-08-01', status: 'upcoming' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Timeline</h1>

      <div className="relative pl-8 border-l border-border">
        {events.map((event, i) => (
          <div key={event.id} className="mb-8 relative">
            <div className="absolute -left-[25px] top-1">
              {event.status === 'completed' ? (
                <CheckCircle2 size={16} className="text-green-500 bg-background" />
              ) : event.status === 'in-progress' ? (
                <Circle size={16} className="text-yellow-500 bg-background" />
              ) : (
                <Circle size={16} className="text-muted-foreground bg-background" />
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-4 ml-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{event.date}</span>
              </div>
              <h3 className="font-semibold text-sm">{event.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
