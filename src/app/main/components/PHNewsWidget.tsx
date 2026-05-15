'use client'

import { useState, useEffect, useCallback } from 'react'

const CACHE_KEY = 'adversity-ph-news'
const CACHE_DURATION = 4 * 60 * 60 * 1000

interface NewsItem {
  title: string
  summary: string
  category: string
  urgency: string
}

export default function PHNewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cached, setCached] = useState(false)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const { news: cachedNews, timestamp } = JSON.parse(cachedData)
        if (Date.now() - timestamp < CACHE_DURATION) {
          setNews(cachedNews)
          setCached(true)
          setLoading(false)
          return
        }
      }
      const res = await fetch('/api/ph-news', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      const items = data.news || []
      localStorage.setItem(CACHE_KEY, JSON.stringify({ news: items, timestamp: Date.now() }))
      setNews(items)
      setCached(data.cached || false)
    } catch {
      setError(true)
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const { news: cachedNews } = JSON.parse(cachedData)
        setNews(cachedNews)
        setCached(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNews() }, [fetchNews])

  const urgencyAttrs = (u: string) => {
    switch (u) {
      case 'high': return { color: '#ef4444', label: 'HIGH' }
      case 'medium': return { color: '#f59e0b', label: 'MED' }
      default: return { color: '#00aaff', label: 'LOW' }
    }
  }

  if (loading) {
    return <div className="space-y-2"><div className="h-3 bg-[#1a1a2e] w-1/4 animate-pulse" /><div className="h-10 bg-[#1a1a2e] w-full animate-pulse" /><div className="h-10 bg-[#1a1a2e] w-full animate-pulse" /></div>
  }
  if (error && news.length === 0) {
    return (
      <>
<div className="hud-card-header main-drag-handle">
          <span className="text-[9px] font-mono text-[#00aaff] uppercase tracking-[0.25em]">■ WORLD THREAT LEVEL</span>
          <span className="text-[8px] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <button onClick={fetchNews} className="text-[10px] font-mono text-[#00aaff] hover:underline text-left mt-2">Retry ↗</button>
      </>
    )
  }

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[9px] font-mono text-[#00aaff] uppercase tracking-[0.25em]">■ WORLD THREAT LEVEL</span>
        <div className="flex items-center gap-2">
          {cached && <span className="text-[8px] font-mono text-[#4a5568] uppercase tracking-[0.15em]">CACHED</span>}
          <button onClick={fetchNews} className="text-[9px] font-mono text-[#4a5568] hover:text-[#00aaff] transition-colors">↻</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[160px] space-y-1.5">
        {news.length === 0 ? (
          <div className="text-[11px] font-mono text-[#4a5568]">&gt; NO INTEL AVAILABLE.</div>
        ) : (
          news.map((item, i) => {
            const attrs = urgencyAttrs(item.urgency)
            return (
              <div key={i} className="border-l-2 pl-2 py-1" style={{ borderColor: attrs.color }}>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[8px] font-mono uppercase tracking-[0.15em] px-1 py-0.5 shrink-0"
                    style={{ color: attrs.color, backgroundColor: `${attrs.color}15` }}
                  >
                    [{attrs.label}]
                  </span>
                  <span className="text-[8px] font-mono text-[#4a5568] uppercase tracking-[0.1em] shrink-0">[{item.category?.toUpperCase() || 'GENERAL'}]</span>
                </div>
                <div className="text-[11px] font-mono text-[#e2e8f0] mt-0.5">{item.title}</div>
                <div className="text-[10px] font-mono text-[#4a5568] mt-0.5">{item.summary}</div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
