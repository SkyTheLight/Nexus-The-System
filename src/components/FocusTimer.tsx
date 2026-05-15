'use client'

import { useEffect, useRef } from 'react'
import { useFocusTimer, WORK_TIME, BREAK_TIME } from '@/lib/focusTimer'
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react'

export default function FocusTimer() {
  const { timeLeft, isRunning, isWork, toggle, reset, tick } = useFocusTimer()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, tick])

  useEffect(() => {
    tick()
  }, [tick])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const total = isWork ? WORK_TIME : BREAK_TIME
  const progress = ((total - timeLeft) / total) * 100

  return (
    <div className="widget-card min-h-[200px] flex flex-col">
      <div className="widget-card-header">
        <span className="widget-card-title">Focus Timer</span>
        <span className="text-xs flex items-center gap-1 text-[var(--color-text-muted)]">
          <Coffee size={12} />
          {isWork ? 'Focus' : 'Break'}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={isWork ? 'var(--color-accent)' : 'var(--color-green)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold font-mono text-white">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="pomodoro-start flex items-center gap-1.5"
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={reset} className="pomodoro-reset flex items-center gap-1">
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
