'use client'

import { useState, useEffect } from 'react'
import { Clock as ClockIcon } from 'lucide-react'

export default function ClockWidget() {
  const [time, setTime] = useState(new Date())
  const [isEditing, setIsEditing] = useState(false)
  const [clockName, setClockName] = useState('Focus Board')

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')
  const period = time.getHours() >= 12 ? 'PM' : 'AM'
  const displayHours = (time.getHours() % 12 || 12).toString().padStart(2, '0')

  return (
    <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]">
      <div className="flex items-center gap-3 mb-4">
        <ClockIcon size={24} className="text-[var(--color-accent)]" />
        {isEditing ? (
          <input
            type="text"
            value={clockName}
            onChange={(e) => setClockName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="bg-transparent text-xl font-bold text-white outline-none"
            autoFocus
          />
        ) : (
          <h2
            onClick={() => setIsEditing(true)}
            className="text-xl font-bold text-white cursor-pointer hover:opacity-80"
          >
            {clockName}
          </h2>
        )}
      </div>
      <div className="flex items-center justify-center">
        <div>
          <div className="clock-time">{displayHours}:{minutes}:{seconds}<span className="clock-ampm">{period}</span></div>
          <div className="text-sm text-[var(--color-text-muted)] mt-2">
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="clock-underline" />
        </div>
      </div>
    </div>
  )
}
