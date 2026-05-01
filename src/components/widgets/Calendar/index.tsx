'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Clock, Plus } from 'lucide-react'
import { useCalendar, formatDate, formatTime, truncate } from './useCalendar'
import AddClassForm from './AddClassForm'
import DayView from './DayView'

export default function CalendarWidget() {
  const {
    currentDate,
    holidays,
    classes,
    loading,
    goToPrevMonth,
    goToNextMonth,
    getDaysInMonth,
    getFirstDayOfMonth,
    isToday,
    getHolidayForDay,
    getClassesForDay,
    formatMonthYear,
    refetch
  } = useCalendar()

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  if (loading) return <div className="text-muted-foreground text-sm p-4">LOADING...</div>

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthYear = formatMonthYear(currentDate)

  // Build calendar grid
  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handleDayClick = (day: number) => {
    setSelectedDay(selectedDay === day ? null : day)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">CALENDAR</h3>
        <button onClick={() => setShowAddForm(!showAddForm)} className="p-1 hover:bg-white/5 rounded transition-colors">
          <Plus size={14} />
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={goToPrevMonth} className="p-1 hover:bg-white/5 rounded">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs text-[#00d4ffcc] font-mono">{monthYear}</span>
        <button onClick={goToNextMonth} className="p-1 hover:bg-white/5 rounded">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="text-[8px] text-[var(--color-accent-dim)] text-center py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0 flex-1">
        {blanks.map((_, i) => (
          <div key={`b-${i}`} className="p-0.5" />
        ))}
        {days.map(day => {
          const holiday = getHolidayForDay(day)
          const dayClasses = getClassesForDay(day)
          const today = isToday(day)
          const isSelected = selectedDay === day

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`p-0.5 cursor-pointer flex flex-col items-center justify-start relative ${
                today ? 'border border-[#00d4ff] rounded' : ''
              } ${isSelected ? 'bg-[#00d4ff11]' : ''}`}
            >
              <span className={`text-[10px] ${today ? 'text-[#00d4ff] font-bold' : 'text-[#ffffffaa]'}`}>
                {day}
              </span>
              <div className="flex gap-0.5 mt-0.5">
                {holiday && <div className="w-1 h-1 rounded-full bg-[#ff6b35]" title={holiday.localName} />}
                {dayClasses.slice(0, 2).map((c, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ background: c.color || '#00d4ff' }}
                    title={c.subject}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected day view */}
      {selectedDay !== null && (
        <DayView
          day={selectedDay}
          date={currentDate}
          holiday={getHolidayForDay(selectedDay)}
          classes={getClassesForDay(selectedDay)}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {/* Add class form */}
      {showAddForm && (
        <AddClassForm onClose={() => setShowAddForm(false)} onSave={refetch} />
      )}
    </div>
  )
}
