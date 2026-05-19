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
          <span className="text-[9px] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ SYSTEM MESSAGE</span>
          <span className="text-[8px] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[12px] font-mono text-[#f7f1e4]">Failed to load.</div>
          <button onClick={fetchLine} className="text-[10px] font-mono text-[#d7b36a] hover:underline mt-1 text-left">Retry ↗</button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[9px] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ SYSTEM MESSAGE</span>
        {cached && <span className="text-[8px] font-mono text-[#6b5a30] uppercase tracking-[0.15em]">CACHED</span>}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[10px] font-mono text-[#7c3aed] uppercase tracking-[0.15em] mb-2">DAILY DIRECTIVE &gt;</div>
        <div className="text-[14px] font-mono italic text-[#7c3aed] leading-relaxed">&ldquo;{line}&rdquo;</div>
        <div className="text-[10px] font-mono text-[#6b5a30] mt-2">— SYSTEM</div>
      </div>
    </>
  )
}
