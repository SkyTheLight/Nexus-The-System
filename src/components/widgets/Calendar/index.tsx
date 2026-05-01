'use client'

import { useState, useEffect } from 'react'
import { getPhilippineHolidays, type Holiday } from '@/lib/holidays'

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])

  useEffect(() => {
    fetch('/api/widget?type=assignments')
      .then(res => res.json())
      .then(data => setDeadlines(data.data || []))
      .catch(() => setDeadlines([]))

    // Load Philippine holidays for current and next year
    const year = new Date().getFullYear()
    setHolidays([
      ...getPhilippineHolidays(year),
      ...getPhilippineHolidays(year + 1),
    ])
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December']

  const deadlineDates = deadlines.map(d => {
    const date = new Date(d.deadline)
    return { day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), title: d.title }
  })

  const holidayDates = holidays.map(h => {
    const date = new Date(h.date)
    return { day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), name: h.name, type: h.type }
  })

  const checkDeadline = (day: number) => {
    return deadlineDates.some(d => d.day === day && d.month === month && d.year === year)
  }

  const getDeadlineColor = (day: number) => {
    const deadline = deadlineDates.find(d => d.day === day && d.month === month && d.year === year)
    if (!deadline) return ''
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500']
    return colors[Math.abs(deadline.title.length) % colors.length]
  }

  const getHoliday = (day: number) => {
    return holidayDates.find(h => h.day === day && h.month === month && h.year === year)
  }

  const getDayColor = (day: number) => {
    const holiday = getHoliday(day)
    if (holiday) {
      if (holiday.type === 'regular') return 'bg-red-600/80 text-white'
      if (holiday.type === 'special') return 'bg-yellow-600/80 text-white'
      if (holiday.type === 'school') return 'bg-green-600/80 text-white'
      return 'bg-blue-600/40 text-blue-300'
    }
    if (checkDeadline(day)) return getDeadlineColor(day)
    return ''
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white">‹</button>
        <h3 className="text-white font-semibold">{monthNames[month]} {year}</h3>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs text-gray-500">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
          const holiday = getHoliday(day)
          const hasDeadline = checkDeadline(day)
          return (
            <div
              key={day}
              className={`text-center text-sm py-1 rounded relative ${
                isToday ? 'bg-blue-600 text-white' :
                getDayColor(day) ? `${getDayColor(day)}` :
                'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <div>{day}</div>
              {holiday && (
                <div className="text-[8px] leading-tight mt-0.5 truncate px-0.5 opacity-90">
                  {holiday.name}
                </div>
              )}
              {hasDeadline && !holiday && (
                <div className="text-[8px] leading-tight mt-0.5 truncate px-0.5 text-blue-300">
                  Deadline
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <div className="w-3 h-3 rounded bg-red-600/80" />
          <span>Regular Holiday</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <div className="w-3 h-3 rounded bg-yellow-600/80" />
          <span>Special Holiday</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <div className="w-3 h-3 rounded bg-green-600/80" />
          <span>School Break</span>
        </div>
      </div>

      {deadlines.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs text-gray-400 uppercase">Upcoming Deadlines</h4>
          {deadlines.slice(0, 3).map((deadline, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${getDeadlineColor(new Date(deadline.deadline).getDate())}`} />
              <span className="text-gray-300 truncate">{deadline.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
