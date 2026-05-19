'use client'

import { useState, useEffect, useCallback } from 'react'

const CACHE_KEY = 'adversity-holidays'
const CACHE_DURATION = 6 * 60 * 60 * 1000

interface Holiday {
  date: string
  localName: string
  name: string
  countryCode: string
  global: boolean
  counties: string[] | null
  types: string[]
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const n = new Date()
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

function getNextHoliday(holidays: Holiday[]): Holiday | null {
  const now = new Date()
  return holidays.find(h => new Date(h.date) > now) || null
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

export default function HolidayWidget() {
  const [todayHoliday, setTodayHoliday] = useState<Holiday | null>(null)
  const [nextHoliday, setNextHoliday] = useState<Holiday | null>(null)
  const [daysLeft, setDaysLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchHolidays = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION) {
          processHolidays(data)
          setLoading(false)
          return
        }
      }
      const year = new Date().getFullYear()
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`)
      if (!res.ok) throw new Error('Failed')
      const data: Holiday[] = await res.json()
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
      processHolidays(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  function processHolidays(holidays: Holiday[]) {
    const today = holidays.find(h => isToday(h.date))
    setTodayHoliday(today || null)
    const next = getNextHoliday(holidays)
    setNextHoliday(next)
    if (next) setDaysLeft(daysUntil(next.date))
  }

  useEffect(() => { fetchHolidays() }, [fetchHolidays])

  if (loading) {
    return <div className="space-y-2"><div className="h-3 bg-[#12121c] w-1/3 animate-pulse" /><div className="h-5 bg-[#12121c] w-2/3 animate-pulse" /><div className="h-3 bg-[#12121c] w-1/2 animate-pulse" /></div>
  }
  if (error) {
    return (
      <>
<div className="hud-card-header drag-handle">
          <span className="text-[9px] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ CALENDAR INTEL</span>
          <span className="text-[8px] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[12px] font-mono text-[#f7f1e4]">Failed to load.</div>
          <button onClick={fetchHolidays} className="text-[10px] font-mono text-[#d7b36a] hover:underline mt-1 text-left">Retry ↗</button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[9px] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ CALENDAR INTEL</span>
        <span className="text-[8px] font-mono text-[#22c55e] uppercase tracking-[0.15em]">ONLINE</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {todayHoliday ? (
          <>
            <div className="text-[9px] font-mono text-[#22c55e] uppercase tracking-[0.2em] mb-1">[ HOLIDAY DETECTED ]</div>
            <div className="text-[18px] font-mono font-bold text-[#22c55e]">{todayHoliday.localName}</div>
            <div className="text-[11px] font-mono text-[#6b5a30] mt-1">STAND DOWN, BOSS. NO OPERATIONS TODAY.</div>
          </>
        ) : nextHoliday ? (
          <>
            <div className="text-[9px] font-mono text-[#6b5a30] uppercase tracking-[0.2em] mb-1">NEXT STAND DOWN</div>
            <div className="text-[18px] font-mono font-bold text-[#f7f1e4]">{nextHoliday.localName}</div>
            <div className="mt-1">
              <span className="text-[24px] font-mono font-bold text-[#d7b36a]">{daysLeft}</span>
              <span className="text-[11px] font-mono text-[#6b5a30] ml-1">DAYS UNTIL NEXT STAND DOWN</span>
            </div>
            <div className="text-[10px] font-mono text-[#6b5a30] mt-0.5">{formatDate(nextHoliday.date)}</div>
          </>
        ) : (
          <div className="text-[12px] font-mono text-[#6b5a30]">No upcoming holidays found.</div>
        )}
      </div>
    </>
  )
}
