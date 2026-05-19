'use client'

import { useState, useEffect, useCallback } from 'react'

export interface PixelaConfig {
  username: string
  graphId: string
  token: string
}

export interface PixelaStats {
  totalPixels: number
  todayCount: number
  maxCount: number
  streak: number
}

const CONFIG_KEY = 'pixela-config'
const STATS_CACHE_KEY = 'pixela-stats-cache'
const CACHE_DURATION = 5 * 60 * 1000

export function usePixela() {
  const [config, setConfig] = useState<PixelaConfig | null>(null)
  const [stats, setStats] = useState<PixelaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [incrementing, setIncrementing] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONFIG_KEY)
      if (raw) setConfig(JSON.parse(raw))
    } catch {}
  }, [])

  const saveConfig = useCallback((c: PixelaConfig) => {
    setConfig(c)
    setConfigOpen(false)
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(c)) } catch {}
  }, [])

  const clearConfig = useCallback(() => {
    setConfig(null)
    setStats(null)
    try { localStorage.removeItem(CONFIG_KEY) } catch {}
  }, [])

  const fetchStats = useCallback(async (cfg: PixelaConfig) => {
    try {
      const cached = localStorage.getItem(STATS_CACHE_KEY)
      if (cached) {
        const entry = JSON.parse(cached)
        if (Date.now() - entry.timestamp < CACHE_DURATION) {
          setStats(entry.stats)
          setLoading(false)
          return
        }
      }
    } catch {}

    try {
      const res = await fetch(
        `https://pixe.la/v1/users/${cfg.username}/graphs/${cfg.graphId}/stats`
      )
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()

      const s: PixelaStats = {
        totalPixels: data.totalPixelsCount ?? 0,
        todayCount: data.todaysQuantity ?? 0,
        maxCount: data.maxQuantity ?? 0,
        streak: data.continuousDaysCount ?? 0,
      }

      setStats(s)
      setError(null)
      try {
        localStorage.setItem(STATS_CACHE_KEY, JSON.stringify({ stats: s, timestamp: Date.now() }))
      } catch {}
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!config) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchStats(config)

    const interval = setInterval(() => fetchStats(config), CACHE_DURATION)
    return () => clearInterval(interval)
  }, [config, fetchStats])

  const increment = useCallback(async () => {
    if (!config) return
    setIncrementing(true)
    try {
      const res = await fetch(
        `https://pixe.la/v1/users/${config.username}/graphs/${config.graphId}/increment`,
        { method: 'POST', headers: { 'X-USER-TOKEN': config.token } }
      )
      if (!res.ok) throw new Error('Failed to increment')
      await fetchStats(config)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIncrementing(false)
    }
  }, [config, fetchStats])

  return {
    config, stats, loading, error,
    configOpen, setConfigOpen,
    saveConfig, clearConfig, increment, incrementing,
  }
}
