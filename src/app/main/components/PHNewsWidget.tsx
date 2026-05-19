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
      default: return { color: '#d7b36a', label: 'LOW' }
    }
  }

  if (loading) {
    return <div className="space-y-2"><div className="h-3 bg-[#12121c] w-1/4 animate-pulse" /><div className="h-10 bg-[#12121c] w-full animate-pulse" /><div className="h-10 bg-[#12121c] w-full animate-pulse" /></div>
  }
  if (error && news.length === 0) {
    return (
      <>
<div className="hud-card-header drag-handle">
          <span className="text-[clamp(7px,1.2cqw,9px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ WORLD THREAT LEVEL</span>
          <span className="text-[clamp(6px,1cqw,8px)] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <button onClick={fetchNews} className="font-mono text-[#d7b36a] hover:underline text-left mt-2" style={{ fontSize: 'clamp(8px,1.4cqw,10px)' }}>Retry ↗</button>
      </>
    )
  }

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[clamp(7px,1.2cqw,9px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ WORLD THREAT LEVEL</span>
        <div className="flex items-center gap-2">
          {cached && <span className="text-[clamp(6px,1cqw,8px)] font-mono text-[#6b5a30] uppercase tracking-[0.15em]">CACHED</span>}
          <button onClick={fetchNews} className="font-mono text-[#6b5a30] hover:text-[#d7b36a] transition-colors" style={{ fontSize: 'clamp(8px,1.3cqw,10px)' }}>↻</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {news.length === 0 ? (
          <div className="font-mono text-[#6b5a30]" style={{ fontSize: 'clamp(9px,1.5cqw,11px)' }}>&gt; NO INTEL AVAILABLE.</div>
        ) : (
          news.map((item, i) => {
            const attrs = urgencyAttrs(item.urgency)
            return (
              <div key={i} className="border-l-2 pl-2 py-1" style={{ borderColor: attrs.color }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-mono uppercase tracking-[0.15em] px-1 py-0.5 shrink-0"
                    style={{ color: attrs.color, backgroundColor: `${attrs.color}15`, fontSize: 'clamp(6px,1cqw,8px)' }}
                  >
                    [{attrs.label}]
                  </span>
                  <span className="font-mono text-[#6b5a30] uppercase tracking-[0.1em] shrink-0" style={{ fontSize: 'clamp(6px,1cqw,8px)' }}>[{item.category?.toUpperCase() || 'GENERAL'}]</span>
                </div>
                <div className="font-mono text-[#f7f1e4] mt-0.5" style={{ fontSize: 'clamp(10px,1.7cqw,12px)' }}>{item.title}</div>
                <div className="font-mono text-[#6b5a30] mt-0.5 line-clamp-2" style={{ fontSize: 'clamp(8px,1.3cqw,10px)' }}>{item.summary}</div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
