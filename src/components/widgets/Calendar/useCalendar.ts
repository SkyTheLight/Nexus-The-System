import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string | null
  location: string | null
  isAllDay: boolean
}

export interface Holiday {
  date: string
  name: string
  localName: string
}

export interface ClassSchedule {
  id: string
  subject: string
  day_of_week: number
  start_time: string
  end_time: string
  room: string
  color: string
}

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [classes, setClasses] = useState<ClassSchedule[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHolidays = useCallback(async (year: number) => {
    const cacheKey = `ph_holidays_${year}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setHolidays(JSON.parse(cached))
        return
      }
    } catch {}

    try {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`)
      if (res.ok) {
        const data = await res.json()
        setHolidays(data)
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data))
        } catch {}
      }
    } catch (e) {
      console.error('Failed to fetch holidays:', e)
    }
  }, [])

  const fetchClasses = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('class_schedule')
        .select('*')
        .order('day_of_week', { ascending: true })

      if (!error && data) {
        setClasses(data)
      }
    } catch (e) {
      console.error('Failed to fetch classes:', e)
    }
  }, [])

  useEffect(() => {
    const year = currentDate.getFullYear()
    fetchHolidays(year)
    fetchClasses().finally(() => setLoading(false))
  }, [currentDate, fetchHolidays, fetchClasses])

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay() // 0=Sun, 6=Sat
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getFullYear() === currentDate.getFullYear() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getDate() === day
    )
  }

  const getHolidayForDay = (day: number): Holiday | null => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return holidays.find(h => h.date === dateStr) || null
  }

  const getClassesForDay = (day: number): ClassSchedule[] => {
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay()
    return classes.filter(c => c.day_of_week === dayOfWeek)
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
  }

  return {
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
    refetch: () => { fetchClasses() }
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase()
}

export function formatTime(dateStr: string, isAllDay: boolean): string {
  if (isAllDay) return 'ALL DAY'
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase()
  } catch {
    return ''
  }
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.substring(0, len) + '...' : str
}
