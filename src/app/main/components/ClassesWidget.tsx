'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CLASSES, DAY_ORDER } from '@/lib/classSchedule'

interface Assignment {
  id: number
  title: string
  deadline: string
  course: string
  completed: boolean
}

function getTodayDay(): string {
  return DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
}

function getTodayClasses() {
  const today = getTodayDay()
  return CLASSES.filter(c => c.slots.some(s => s.day === today))
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
}

function isCurrentlyActive(slot: { day: string; start: string; end: string }): boolean {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const parseTime = (t: string): number => {
    const [time, mod] = t.split(' ')
    let [h, m] = time.split(':').map(Number)
    if (mod === 'PM' && h !== 12) h += 12
    if (mod === 'AM' && h === 12) h = 0
    return h * 60 + m
  }

  const start = parseTime(slot.start)
  const end = parseTime(slot.end)
  return currentMinutes >= start && currentMinutes < end
}

function isPast(slot: { day: string; start: string; end: string }): boolean {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const parseTime = (t: string): number => {
    const [time, mod] = t.split(' ')
    let [h, m] = time.split(':').map(Number)
    if (mod === 'PM' && h !== 12) h += 12
    if (mod === 'AM' && h === 12) h = 0
    return h * 60 + m
  }

  return currentMinutes > parseTime(slot.end)
}

export default function ClassesWidget() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const sb = getSupabase()
      if (!sb) throw new Error('No Supabase')
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const { data, error: err } = await sb
        .from('assignments')
        .select('id, title, deadline, course, completed')
        .eq('completed', false)
        .gte('deadline', now.toISOString())
        .lte('deadline', weekFromNow.toISOString())
        .order('deadline', { ascending: true })

      if (err) throw err
      setAssignments(data || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return <div className="space-y-2"><div className="h-3 bg-[#12121c] w-1/3 animate-pulse" /><div className="h-8 bg-[#12121c] w-full animate-pulse" /><div className="h-8 bg-[#12121c] w-full animate-pulse" /></div>
  }
  if (error) {
    return (
      <>
<div className="hud-card-header drag-handle">
          <span className="text-[clamp(10px,1.5cqw,12px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ TRAINING SCHEDULE</span>
          <span className="text-[clamp(9px,1.3cqw,11px)] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <button onClick={fetchData} className="font-mono text-[#d7b36a] hover:underline text-left mt-2" style={{ fontSize: 'clamp(11px,1.8cqw,13px)' }}>Retry ↗</button>
      </>
    )
  }

  const todayClasses = getTodayClasses()
  const now = new Date()

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[clamp(10px,1.5cqw,12px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ TRAINING SCHEDULE</span>
        {assignments.some(a => daysUntil(a.deadline) === 0) && (
          <span className="text-[clamp(9px,1.3cqw,11px)] font-mono text-[#ef4444] uppercase tracking-[0.15em]">[ CRITICAL ]</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {/* Today's Classes */}
        <div>
          <div className="font-mono text-[#6b5a30] uppercase tracking-[0.25em] mb-1" style={{ fontSize: 'clamp(9px,1.3cqw,11px)' }}>TODAY'S SESSIONS</div>
          {todayClasses.length === 0 ? (
            <div className="font-mono text-[#6b5a30]" style={{ fontSize: 'clamp(12px,1.9cqw,14px)' }}>&gt; NO TRAINING SCHEDULED TODAY, HUNTER.</div>
          ) : (
            <div className="space-y-1">
              {todayClasses.map(cls =>
                cls.slots.filter(s => s.day === getTodayDay()).map((slot, i) => {
                  const active = isCurrentlyActive(slot)
                  const past = isPast(slot)
                  return (
                    <div
                      key={`${cls.code}-${i}`}
                      className={`flex items-center justify-between py-1 px-1 ${
                        active ? 'border-l-2 border-[#d7b36a] bg-[#111124]' : ''
                      } ${past ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[#d7b36a] tabular-nums shrink-0" style={{ fontSize: 'clamp(11px,1.7cqw,13px)' }}>{slot.start}</span>
                        <span className="font-mono text-[#f7f1e4] truncate" style={{ fontSize: 'clamp(12px,1.9cqw,14px)' }}>{cls.code}</span>
                      </div>
                      {active && (
                        <span className="font-mono text-[#d7b36a] uppercase tracking-[0.2em] shrink-0 ml-2" style={{ fontSize: 'clamp(9px,1.3cqw,11px)' }}>[ ACTIVE ]</span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="rc-hide-sm pt-2 border-t border-[#1a1a2e]">
          <div className="font-mono text-[#6b5a30] uppercase tracking-[0.25em] mb-1" style={{ fontSize: 'clamp(9px,1.3cqw,11px)' }}>DEPLOYMENTS DUE</div>
          {assignments.length === 0 ? (
            <div className="font-mono text-[#6b5a30]" style={{ fontSize: 'clamp(12px,1.9cqw,14px)' }}>&gt; NO PENDING DEPLOYMENTS.</div>
          ) : (
            <div className="space-y-1">
              {assignments.map(a => {
                const days = daysUntil(a.deadline)
                const isCritical = days <= 0
                const isUrgent = days === 1
                const isPending = days <= 7

                return (
                  <div key={a.id} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {a.course && (
                        <span className="rc-hide-xs font-mono text-[#6b5a30] uppercase tracking-[0.15em] shrink-0" style={{ fontSize: 'clamp(9px,1.3cqw,11px)' }}>{a.course}</span>
                      )}
                      <span className="font-mono text-[#f7f1e4] truncate" style={{ fontSize: 'clamp(12px,1.9cqw,14px)' }}>{a.title}</span>
                    </div>
                    <span
                      className="font-mono uppercase tracking-[0.15em] shrink-0 ml-2"
                      style={{ color: isCritical ? '#ef4444' : isUrgent ? '#f59e0b' : '#d7b36a', fontSize: 'clamp(9px,1.3cqw,11px)' }}
                    >
                      [{isCritical ? 'CRITICAL' : isUrgent ? 'URGENT' : 'PENDING'}]
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
