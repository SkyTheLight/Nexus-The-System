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
    <div className="p-6 bg-[#0B0B0C] border border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <ClockIcon size={24} className="text-primary" />
        {isEditing ? (
          <input
            type="text"
            value={clockName}
            onChange={(e) => setClockName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="bg-transparent text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent focus:outline-none"
            autoFocus
          />
        ) : (
          <h2
            onClick={() => setIsEditing(true)}
            className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80"
          >
            {clockName}
          </h2>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div>
          <div className="text-5xl font-bold font-mono">
            {displayHours}:{minutes}:{seconds}
            <span className="text-2xl font-normal text-muted-foreground ml-3">{period}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  )
}
