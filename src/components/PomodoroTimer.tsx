'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

const WORK_TIME = 25 * 60 // 25 minutes
const BREAK_TIME = 5 * 60 // 5 minutes

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [timerName, setTimerName] = useState('Focus Time')

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = isWork
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100

  useEffect(() => {
    if (!isRunning) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const nextIsWork = !isWork
          setIsWork(nextIsWork)
          return nextIsWork ? WORK_TIME : BREAK_TIME
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning, isWork])

  const toggle = () => setIsRunning(!isRunning)
  const reset = () => {
    setIsRunning(false)
    setIsWork(true)
    setTimeLeft(WORK_TIME)
  }

  return (
    <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] space-y-4">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={timerName}
            onChange={(e) => setTimerName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="bg-transparent text-lg font-semibold text-white outline-none"
            autoFocus
          />
        ) : (
          <h3
            onClick={() => setIsEditing(true)}
            className="text-lg font-semibold text-white cursor-pointer hover:opacity-80"
          >
            {timerName}
          </h3>
        )}
        <span className="text-sm text-[var(--color-text-muted)]">{isWork ? '25:00' : '5:00'}</span>
      </div>

      <div className="relative h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isWork ? 'bg-[var(--color-accent)]' : 'bg-[#22c55e]'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="text-5xl font-bold font-mono">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={toggle}
          className="pomodoro-start"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="pomodoro-reset"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  )
}
