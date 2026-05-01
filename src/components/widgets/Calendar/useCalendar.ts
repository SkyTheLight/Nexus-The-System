import { useState, useEffect, useCallback } from 'react'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string | null
  location: string | null
  isAllDay: boolean
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(true)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/calendar')
      const data = await res.json()

      if (!data.authenticated) {
        setAuthenticated(false)
        setEvents([])
      } else {
        setAuthenticated(true)
        setEvents(data.events || [])
      }
    } catch (e) {
      console.error('Calendar fetch error:', e)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()

    const interval = setInterval(fetchEvents, 5 * 60 * 1000) // 5 min
    return () => clearInterval(interval)
  }, [fetchEvents])

  return { events, loading, authenticated, refetch: fetchEvents }
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
