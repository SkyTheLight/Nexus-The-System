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
      <div>
        <div className="text-[9px] font-mono text-[#4a5568] uppercase tracking-[0.25em] mb-1">[ SYSTEM ONLINE ]</div>
        <div className="text-[20px] md:text-[22px] font-mono font-bold text-[#00aaff] leading-tight">
          {getGreeting()} <span className="inline-block w-[10px] h-[22px] bg-[#00aaff] align-middle ml-0.5 animate-pulse" style={{ animationName: 'cursor-blink', animationDuration: '1s' }} />
        </div>
        <div className="text-[30px] md:text-[32px] font-mono font-bold text-[#00aaff] tabular-nums mt-1 leading-tight">{time}</div>
        <div className="text-[12px] font-mono text-[#4a5568] mt-1">{getPHDate()}</div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] font-mono text-[#4a5568] uppercase tracking-[0.25em]">DAY PROGRESS</span>
          <span className="text-[8px] font-mono text-[#a855f7]">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-[#1a1a2e] relative overflow-hidden" style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }}>
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00aaff, #7c3aed)',
              boxShadow: '0 0 6px rgba(0, 170, 255, 0.4)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
