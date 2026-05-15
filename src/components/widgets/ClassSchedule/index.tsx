'use client'

import { GraduationCap, Clock, MapPin } from 'lucide-react'
import { CLASSES, DAY_ORDER, DAY_LABELS } from '@/lib/classSchedule'

const DAY_LABELS_MAP: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
}

export default function ClassScheduleWidget() {
  const today = DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  const byDay = DAY_ORDER.map(day => ({
    day,
    label: DAY_LABELS_MAP[day],
    isToday: day === today,
    classes: CLASSES.filter(c => c.slots.some(s => s.day === day)),
  })).filter(g => g.classes.length > 0)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap size={16} className="text-blue-400" />
        <h3 className="font-semibold text-sm">Class Schedule</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {byDay.map(group => (
          <div key={group.day}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`text-[10px] font-semibold uppercase tracking-wider ${group.isToday ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                {group.label}
              </div>
              {group.isToday && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium">Today</span>
              )}
            </div>

            <div className="space-y-1.5">
              {group.classes.map(cls => (
                <div key={cls.code} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-start justify-between mb-1">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white">{cls.code}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] leading-tight truncate">{cls.title}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[var(--color-text-muted)]">
                    {cls.slots
                      .filter(s => s.day === group.day)
                      .map((slot, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Clock size={9} />
                          {slot.start} – {slot.end}
                          <MapPin size={9} className="ml-1" />
                          {slot.room}
                        </div>
                      ))}
                  </div>

                  <div className="text-[9px] text-[var(--color-text-muted)] mt-0.5">
                    {cls.instructor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
