'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, AlertTriangle, BookOpen, Clock } from 'lucide-react'
import { getPhilippineHolidays, type Holiday } from '@/lib/holidays'

export default function DateHighlightWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load holidays
    const year = new Date().getFullYear()
    setHolidays([
      ...getPhilippineHolidays(year),
      ...getPhilippineHolidays(year + 1),
    ])

    // Load assignments with deadlines
    fetch('/api/widget?type=assignments')
      .then(res => res.json())
      .then(data => setDeadlines(data.data || []))
      .catch(() => setDeadlines([]))
  }, [])

  if (!mounted) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  const today = currentDate
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Get today's holidays
  const todaysHolidays = holidays.filter(h => {
    const hDate = new Date(h.date)
    return hDate.getDate() === day && hDate.getMonth() === month && hDate.getFullYear() === year
  })

  // Get today's deadlines
  const todaysDeadlines = deadlines.filter(d => {
    if (!d.deadline) return false
    const deadlineDate = new Date(d.deadline)
    return deadlineDate.getDate() === day &&
           deadlineDate.getMonth() === month &&
           deadlineDate.getFullYear() === year
  })

  const getHolidayColor = (type: string) => {
    switch(type) {
      case 'regular': return 'bg-red-600/80 border-red-500'
      case 'special': return 'bg-yellow-600/80 border-yellow-500'
      case 'school': return 'bg-green-600/80 border-green-500'
      default: return 'bg-blue-600/40 border-blue-500'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Date Display */}
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-white">{day}</div>
        <div className="text-lg text-gray-300">{monthNames[month]} {year}</div>
        <div className="text-sm text-gray-400">{dayNames[today.getDay()]}</div>
      </div>

      {/* Today's Events */}
      <div className="flex-1 space-y-3">
        {/* Holidays */}
        {todaysHolidays.length > 0 && (
          <div>
            <h4 className="text-xs text-gray-400 uppercase mb-2 flex items-center gap-1">
              <CalendarDays size={12} />
              Holidays Today
            </h4>
            {todaysHolidays.map((holiday, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border ${getHolidayColor(holiday.type)} mb-1`}
              >
                <div className="text-sm font-semibold text-white">{holiday.name}</div>
                <div className="text-xs text-gray-300 capitalize">{holiday.type} Holiday</div>
              </div>
            ))}
          </div>
        )}

        {/* Assignment Deadlines */}
        {todaysDeadlines.length > 0 && (
          <div>
            <h4 className="text-xs text-gray-400 uppercase mb-2 flex items-center gap-1">
              <AlertTriangle size={12} />
              Deadlines Today
            </h4>
            {todaysDeadlines.map((deadline, idx) => (
              <div key={idx} className="p-2 rounded bg-red-900/30 border border-red-700/50 mb-1">
                <div className="text-sm text-white truncate">{deadline.title}</div>
                {deadline.course && (
                  <div className="text-xs text-gray-400">{deadline.course}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Events */}
        {todaysHolidays.length === 0 && todaysDeadlines.length === 0 && (
          <div className="text-center py-4">
            <Clock size={32} className="mx-auto mb-2 text-gray-600" />
            <p className="text-sm text-gray-500">No events today</p>
            <p className="text-xs text-gray-600 mt-1">Enjoy your free day!</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-white">{todaysHolidays.length}</div>
            <div className="text-xs text-gray-400">Holidays</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{todaysDeadlines.length}</div>
            <div className="text-xs text-gray-400">Deadlines</div>
          </div>
        </div>
      </div>
    </div>
  )
}
