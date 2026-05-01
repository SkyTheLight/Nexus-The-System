'use client'

import { useEffect } from 'react'
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useCalendar, formatDate, formatTime, truncate } from './useCalendar'

export default function CalendarWidget() {
  const { events, loading, authenticated, refetch } = useCalendar()

  if (loading) return <div className="text-muted-foreground text-sm p-4">LOADING...</div>

  const today = formatDate(new Date())

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">CALENDAR</h3>
        <button onClick={refetch} className="p-1 hover:bg-white/5 rounded transition-colors">
          <CalendarIcon size={14} />
        </button>
      </div>

      <div className="text-xs text-[#00d4ff88] mb-3">{today}</div>

      {!authenticated && (
        <button
          onClick={() => signIn('google')}
          className="w-full py-2 mb-3 bg-[#00d4ff] text-black text-xs font-bold rounded hover:opacity-90 transition-opacity"
        >
          CONNECT GOOGLE CALENDAR
        </button>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {events.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            No upcoming events.
          </div>
        ) : (
          events.map((event, i) => {
            const isFirst = i === 0
            return (
              <div
                key={event.id}
                className="p-2 bg-[#0B0B0C] border border-[#00d4ff22] rounded-lg"
              >
                <div className="flex items-start gap-2">
                  {isFirst && (
                    <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">
                      {event.title}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-[#00d4ff88]">
                      <Clock size={10} />
                      {event.isAllDay
                        ? 'ALL DAY'
                        : `${formatTime(event.start, false)} - ${event.end ? formatTime(event.end, false) : ''}`}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#00d4ff88] truncate">
                        <MapPin size={10} />
                        {truncate(event.location, 30)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
