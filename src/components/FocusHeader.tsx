'use client'

import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function FocusHeader() {
  const [greeting, setGreeting] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setGreeting(getGreeting())
    setDateStr(formatDate())
    setMounted(true)

    const interval = setInterval(() => {
      setGreeting(getGreeting())
      setDateStr(formatDate())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="mb-6">
        <div className="h-8 w-64 bg-white/5 rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white">
        {greeting}, Sky
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm text-[var(--color-text-muted)]">{dateStr}</span>
      </div>
    </div>
  )
}
