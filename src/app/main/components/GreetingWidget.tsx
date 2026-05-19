'use client'

import { useState, useEffect } from 'react'

function getPHTime(): string {
  return new Date().toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function getPHDate(): string {
  return new Date().toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'GOOD MORNING, BOSS.'
  if (h >= 12 && h < 18) return 'GOOD AFTERNOON, BOSS.'
  if (h >= 18 && h < 21) return 'GOOD EVENING, BOSS.'
  return 'WORKING LATE, BOSS.'
}

function getDayProgress(): number {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100
}

export default function GreetingWidget() {
  const [time, setTime] = useState('')
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(getPHTime())
    setProgress(getDayProgress())
    const id = setInterval(() => {
      setTime(getPHTime())
      setProgress(getDayProgress())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-2 w-full">
        <div className="h-3 bg-[#1a1a2e] w-1/4 animate-pulse" />
        <div className="h-6 bg-[#1a1a2e] w-3/4 animate-pulse" />
        <div className="h-8 bg-[#1a1a2e] w-1/2 animate-pulse" />
      </div>
    )
  }

  return (
      <div className="h-full flex flex-col justify-between">
        <div className="hud-card-header drag-handle">
          <span className="text-[clamp(7px,1.2cqw,9px)] font-mono text-[#6b5a30] uppercase tracking-[0.25em]">■ SYSTEM STATUS</span>
          <span className="text-[clamp(7px,1.2cqw,9px)] font-mono text-[#d7b36a]">ONLINE</span>
        </div>
        <div>
          <div className="font-mono font-bold text-[#d7b36a] leading-tight" style={{ fontSize: 'clamp(14px, 3.5cqw, 22px)' }}>
            {getGreeting()} <span className="inline-block align-middle ml-0.5 animate-pulse" style={{ width: 'clamp(6px,1cqw,10px)', height: 'clamp(14px,3.5cqw,22px)', backgroundColor: '#d7b36a', animationName: 'cursor-blink', animationDuration: '1s' }} />
          </div>
          <div className="font-mono font-bold text-[#d7b36a] tabular-nums mt-0.5 leading-tight" style={{ fontSize: 'clamp(18px, 5cqw, 34px)' }}>{time}</div>
          <div className="font-mono text-[#6b5a30] mt-0.5" style={{ fontSize: 'clamp(9px, 1.6cqw, 12px)' }}>{getPHDate()}</div>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[clamp(6px,1cqw,8px)] font-mono text-[#6b5a30] uppercase tracking-[0.25em]">DAY PROGRESS</span>
            <span className="text-[clamp(6px,1cqw,8px)] font-mono text-[#7c3aed]">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-[#12121c] relative overflow-hidden" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }}>
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #d7b36a, #7c3aed)',
                boxShadow: '0 0 6px rgba(215, 179, 106, 0.4)',
              }}
            />
          </div>
        </div>
      </div>
  )
}
