'use client'

import { MapPin, Clock, X } from 'lucide-react'
import { Holiday, ClassSchedule } from './useCalendar'

interface DayViewProps {
  day: number
  date: Date
  holiday: Holiday | null
  classes: ClassSchedule[]
  onClose: () => void
}

export default function DayView({ day, date, holiday, classes, onClose }: DayViewProps) {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return (
    <div className="mt-3 p-3 bg-[#0B0B0C] border border-[#00d4ff22] rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#00d4ffcc]">
          {new Date(date.getFullYear(), date.getMonth(), day).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }).toUpperCase()}
        </span>
        <button onClick={onClose} className="p-0.5 hover:bg-white/5 rounded">
          <X size={10} />
        </button>
      </div>

      {holiday && (
        <div className="mb-2 p-2 bg-[#ff6b3511] border border-[#ff6b3522] rounded">
          <div className="flex items-center gap-1 text-[10px] text-[#ff6b35]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
            {holiday.localName || holiday.name}
          </div>
        </div>
      )}

      {classes.length === 0 && !holiday && (
        <div className="text-[10px] text-[#ffffff44] text-center py-2">No classes today.</div>
      )}

      {classes.map(c => (
        <div key={c.id} className="mb-2 p-2 bg-[#111113] border border-[#ffffff08] rounded">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color || '#00d4ff' }} />
            <span className="text-xs text-white truncate">{c.subject}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-[#00d4ff88]">
            <Clock size={10} />
            {c.start_time} - {c.end_time}
          </div>
          {c.room && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#00d4ff88]">
              <MapPin size={10} />
              {c.room}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
