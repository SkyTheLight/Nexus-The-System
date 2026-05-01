import { useState, useEffect, useRef, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'

export interface ScreenTimeSession {
  id?: string
  date: string
  activeMs: number
  updatedAt?: string
}

export interface ManualSiteTime {
  id?: string
  siteName: string
  minutes: number
  date: string
}

const SESSION_FLUSH_INTERVAL = 60 * 1000 // 60 seconds
const TODAY = () => new Date().toISOString().split('T')[0]

export function useScreenTime() {
  const [todayActiveMs, setTodayActiveMs] = useState(0)
  const [sessionActiveMs, setSessionActiveMs] = useState(0)
  const [weekHistory, setWeekHistory] = useState<{ date: string; activeMs: number }[]>([])
  const [manualEntries, setManualEntries] = useState<ManualSiteTime[]>([])
  const [loading, setLoading] = useState(true)

  const sessionStartRef = useRef<number | null>(null)
  const totalActiveRef = useRef(0)
  const sessionActiveRef = useRef(0)
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate today's total from manual entries
  const getManualTodayTotal = useCallback(() => {
    const today = TODAY()
    return manualEntries
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.minutes * 60 * 1000, 0)
  }, [manualEntries])

  // Format ms to Xh Ym
  const formatTime = useCallback((ms: number) => {
    const totalMinutes = Math.floor(ms / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}m`
  }, [])

  // Flush current session to Supabase
  const flushSession = useCallback(async () => {
    const today = TODAY()
    const totalMs = totalActiveRef.current

    const supabase = getSupabase()
    if (!supabase) {
      // Save to localStorage only
      const key = `screen-time-${today}`
      const saved = localStorage.getItem(key)
      const data: ScreenTimeSession = saved ? JSON.parse(saved) : { date: today, activeMs: 0 }
      data.activeMs = totalMs
      localStorage.setItem(key, JSON.stringify(data))
      return
    }

    try {
      const { error } = await supabase
        .from('screen_time_sessions')
        .upsert({
          date: today,
          active_ms: totalMs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'date'
        })

      if (error) console.error('Failed to flush session:', error)
    } catch (e) {
      console.error('Failed to flush session:', e)
    }
  }, [])

  // Load today's data from Supabase or localStorage
  const loadTodayData = useCallback(async () => {
    setLoading(true)
    const today = TODAY()

    // Load session data
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('screen_time_sessions')
          .select('*')
          .eq('date', today)
          .single()

        if (!error && data) {
          totalActiveRef.current = data.active_ms || 0
          setTodayActiveMs(data.active_ms || 0)
        }
      } catch {
        // fallback to localStorage
      }
    }

    // Fallback to localStorage
    if (totalActiveRef.current === 0) {
      const key = `screen-time-${today}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const data: ScreenTimeSession = JSON.parse(saved)
        totalActiveRef.current = data.activeMs
        setTodayActiveMs(data.activeMs)
      }
    }

    // Load manual entries from localStorage
    try {
      const manualKey = `manual-sites-${today}`
      const manualSaved = localStorage.getItem(manualKey)
      if (manualSaved) {
        setManualEntries(JSON.parse(manualSaved))
      }
    } catch {
      // ignore
    }

    // Load 7-day history
    const history: { date: string; activeMs: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const key = `screen-time-${dateStr}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const data: ScreenTimeSession = JSON.parse(saved)
        history.push({ date: dateStr, activeMs: data.activeMs })
      } else {
        history.push({ date: dateStr, activeMs: 0 })
      }
    }
    setWeekHistory(history)

    setLoading(false)
  }, [])

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Resume tracking
        sessionStartRef.current = Date.now()
      } else {
        // Pause tracking, add elapsed time
        if (sessionStartRef.current !== null) {
          const elapsed = Date.now() - sessionStartRef.current
          totalActiveRef.current += elapsed
          sessionActiveRef.current += elapsed
          setTodayActiveMs(totalActiveRef.current)
          setSessionActiveMs(sessionActiveRef.current)
          sessionStartRef.current = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start tracking
    sessionStartRef.current = Date.now()

    // Live session timer (update every second)
    const liveTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && sessionStartRef.current !== null) {
        const elapsed = Date.now() - sessionStartRef.current
        setSessionActiveMs(sessionActiveRef.current + elapsed)
      }
    }, 1000)

    // Flush every 60 seconds
    flushTimerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible' && sessionStartRef.current !== null) {
        const elapsed = Date.now() - sessionStartRef.current
        totalActiveRef.current += elapsed
        sessionActiveRef.current += elapsed
        setTodayActiveMs(totalActiveRef.current)
        setSessionActiveMs(sessionActiveRef.current)
        sessionStartRef.current = Date.now()
        flushSession()
      }
    }, SESSION_FLUSH_INTERVAL)

    // Flush on tab close
    const handleBeforeUnload = () => {
      if (sessionStartRef.current !== null) {
        const elapsed = Date.now() - sessionStartRef.current
        totalActiveRef.current += elapsed
        flushSession()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(liveTimer)
      if (flushTimerRef.current) clearInterval(flushTimerRef.current)
      window.removeEventListener('beforeunload', handleBeforeUnload)

      // Final flush
      if (sessionStartRef.current !== null) {
        const elapsed = Date.now() - sessionStartRef.current
        totalActiveRef.current += elapsed
        flushSession()
      }
    }
  }, [flushSession])

  // Load data on mount
  useEffect(() => {
    loadTodayData()
  }, [loadTodayData])

  // Add manual site time
  const addManualTime = useCallback((siteName: string, minutes: number) => {
    const today = TODAY()
    const newEntry: ManualSiteTime = {
      id: `manual-${Date.now()}`,
      siteName,
      minutes,
      date: today
    }

    const updated = [...manualEntries, newEntry]
    setManualEntries(updated)

    // Save to localStorage
    const key = `manual-sites-${today}`
    localStorage.setItem(key, JSON.stringify(updated))

    // Save to Supabase
    const supabase = getSupabase()
    if (supabase) {
      supabase
        .from('manual_site_time')
        .insert({
          site_name: siteName,
          minutes,
          date: today
        })
        .then(() => {})
        .catch(() => {})
    }
  }, [manualEntries])

  const removeManualEntry = useCallback((id: string) => {
    const updated = manualEntries.filter(e => e.id !== id)
    setManualEntries(updated)
    const today = TODAY()
    const key = `manual-sites-${today}`
    localStorage.setItem(key, JSON.stringify(updated))
  }, [manualEntries])

  const totalTodayMs = todayActiveMs + getManualTodayTotal()
  const weekTotalMs = weekHistory.reduce((sum, d) => sum + d.activeMs, 0) + getManualTodayTotal()
  const weekTotalHours = Math.floor(weekTotalMs / 3600000)

  return {
    todayActiveMs: totalTodayMs,
    sessionActiveMs,
    weekHistory,
    manualEntries,
    weekTotalHours,
    loading,
    formatTime,
    addManualTime,
    removeManualEntry,
    refetch: loadTodayData
  }
}
