'use client'

import { useState, useEffect, useCallback } from 'react'

const CACHE_KEY = 'adversity-motivation'

export default function MotivationWidget() {
  const [line, setLine] = useState('')
  const [cached, setCached] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchLine = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const { line: cachedLine, date } = JSON.parse(cachedData)
        if (date === new Date().toDateString()) {
          setLine(cachedLine)
          setCached(true)
          setLoading(false)
          return
        }
      }
      const res = await fetch('/api/motivation', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const motivation = data.motivation || 'Keep building.'
      localStorage.setItem(CACHE_KEY, JSON.stringify({ line: motivation, date: new Date().toDateString() }))
      setLine(motivation)
      setCached(data.cached || false)
    } catch {
      setError(true)
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const { line: cachedLine } = JSON.parse(cachedData)
        setLine(cachedLine)
        setCached(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLine() }, [fetchLine])

  if (loading) {
    return <div className="space-y-2"><div className="h-3 bg-[#12121c] w-1/4 animate-pulse" /><div className="h-4 bg-[#12121c] w-full animate-pulse" /><div className="h-4 bg-[#12121c] w-3/4 animate-pulse" /></div>
  }
  if (error && !line) {
    return (
      <>
<div className="hud-card-header drag-handle">
          <span className="text-[clamp(10px,1.5cqw,12px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ SYSTEM MESSAGE</span>
          <span className="text-[clamp(9px,1.3cqw,11px)] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="font-mono text-[#f7f1e4]" style={{ fontSize: 'clamp(13px,2.5cqw,15px)' }}>Failed to load.</div>
          <button onClick={fetchLine} className="font-mono text-[#d7b36a] hover:underline mt-1 text-left" style={{ fontSize: 'clamp(11px,1.8cqw,13px)' }}>Retry ↗</button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[clamp(10px,1.5cqw,12px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ SYSTEM MESSAGE</span>
        {cached && <span className="text-[clamp(9px,1.3cqw,11px)] font-mono text-[#6b5a30] uppercase tracking-[0.15em]">CACHED</span>}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="rc-hide-xs font-mono text-[#7c3aed] uppercase tracking-[0.15em] mb-2" style={{ fontSize: 'clamp(11px,1.8cqw,13px)' }}>DAILY DIRECTIVE &gt;</div>
        <div className="font-mono italic text-[#7c3aed] leading-relaxed line-clamp-4" style={{ fontSize: 'clamp(13px,2.6cqw,18px)' }}>&ldquo;{line}&rdquo;</div>
        <div className="rc-hide-sm font-mono text-[#6b5a30] mt-2" style={{ fontSize: 'clamp(11px,1.7cqw,13px)' }}>— SYSTEM</div>
      </div>
    </>
  )
}
