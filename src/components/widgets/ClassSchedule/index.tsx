'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, MapPin, Clock } from 'lucide-react'

interface ClassEvent {
  title: string
  start: string
  end: string
  location: string
  type: string
}

interface CourseSchedule {
  course_name: string
  course_code: string
  events: ClassEvent[]
}

export default function ClassScheduleWidget() {
  const [schedule, setSchedule] = useState<CourseSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/canvas/schedule')
      .then(res => res.json())
      .then(data => {
        setSchedule(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (!mounted) return <div className="text-muted-foreground text-sm p-4">Loading...</div>
  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading classes...</div>

  const allEvents = schedule.flatMap(course => 
    course.events.map(e => ({ ...e, course_name: course.course_name, course_code: course.course_code }))
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={16} className="text-blue-400" />
        <h3 className="font-semibold text-sm">Today's Classes</h3>
      </div>

      {allEvents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">No classes today</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {allEvents.map((event, idx) => (
            <div key={idx} className="p-2 bg-gray-800/50 rounded border border-gray-700">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{event.course_code}</div>
                  <div className="text-xs text-gray-300">{event.course_name}</div>
                </div>
                <span className="text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-400 rounded">
                  {event.type}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                <div className="flex items-center gap-1">
                  <Clock size={10} />
                  {formatTime(event.start)} - {formatTime(event.end)}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={10} />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
