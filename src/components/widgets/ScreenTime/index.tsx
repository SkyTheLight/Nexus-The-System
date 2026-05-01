'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'
import { useScreenTime } from './useScreenTime'

export default function ScreenTimeWidget() {
  const {
    todayActiveMs,
    sessionActiveMs,
    weekHistory,
    manualEntries,
    weekTotalHours,
    loading,
    formatTime,
    addManualTime,
    removeManualEntry
  } = useScreenTime()

  const [showForm, setShowForm] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [minutes, setMinutes] = useState(0)

  const [sessionSeconds, setSessionSeconds] = useState(0)

  // Count up every second while tab is visible
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Reset counter when sessionActiveMs changes (visibility change)
  useEffect(() => {
    setSessionSeconds(Math.floor(sessionActiveMs / 1000))
  }, [sessionActiveMs])

  const formatSession = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleAdd = () => {
    if (!siteName.trim() || minutes <= 0) return
    addManualTime(siteName.trim(), minutes)
    setSiteName('')
    setMinutes(0)
    setShowForm(false)
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">LOADING...</div>

  const maxBarMs = Math.max(...weekHistory.map(d => d.activeMs), 1)

  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    // Show debug indicator in development
    if (process.env.NODE_ENV === 'development') {
      setDebugMode(true)
    }
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">SCREEN TIME</h3>
        <div className="flex items-center gap-2">
          {debugMode && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] ${
              document?.visibilityState === 'visible'
                ? 'bg-[#22c55e33] text-[#22c55e] animate-pulse'
                : 'bg-[#ffffff22] text-[#ffffff44]'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                document?.visibilityState === 'visible' ? 'bg-[#22c55e]' : 'bg-[#ffffff44]'
              }`} />
              {document?.visibilityState === 'visible' ? 'TRACKING' : 'PAUSED'}
            </div>
          )}
          <button onClick={() => setShowForm(!showForm)} className="p-1 hover:bg-white/5 rounded transition-colors">
            {showForm ? <Trash2 size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>

      {/* Today's total */}
      <div className="text-center mb-3">
        <div className="text-2xl font-bold">{formatTime(todayActiveMs)}</div>
        <div className="text-xs text-[#00d4ff88]">Today (Dashboard Active)</div>
      </div>

      {/* Live session timer */}
      <div className="flex items-center justify-center gap-2 mb-4 text-xs text-[#00d4ffcc]">
        <Clock size={12} />
        <span className="font-mono">{formatSession(sessionSeconds)}</span>
        <span className="text-[#00d4ff44]">LIVE</span>
      </div>

      {/* 7-day bar chart */}
      <div className="mb-4">
        <div className="text-[10px] text-[#00d4ff88] mb-2">7-DAY HISTORY</div>
        <div className="flex items-end gap-1 h-16">
          {weekHistory.map((d, i) => {
            const heightPct = maxBarMs > 0 ? (d.activeMs / maxBarMs) * 100 : 0
            const dayLabel = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
            const isToday = d.date === new Date().toISOString().split('T')[0]
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full ${isToday ? 'bg-[#00d4ff]' : 'bg-[#00d4ff44]'} rounded-t`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
                <span className={`text-[8px] ${isToday ? 'text-[#00d4ff]' : 'text-[#00d4ff44]'}`}>{dayLabel}</span>
              </div>
            )
          })}
        </div>
        <div className="text-[10px] text-[#00d4ff88] mt-2">This week: {weekTotalHours} hours</div>
      </div>

      {/* Add manual entry form */}
      {showForm && (
        <div className="mb-3 p-3 bg-[#0B0B0C] border border-[#00d4ff22] rounded-lg space-y-2">
          <input
            type="text"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            placeholder="Site name"
            className="w-full px-2 py-1 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={minutes}
              onChange={e => setMinutes(parseInt(e.target.value) || 0)}
              placeholder="Minutes"
              className="flex-1 px-2 py-1 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-1 bg-[#00d4ff] text-black text-xs font-bold rounded hover:opacity-90 transition-opacity"
          >
            ADD TIME
          </button>
        </div>
      )}

      {/* Manual entries */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {manualEntries.map(entry => (
          <div key={entry.id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded group">
            <span className="text-xs flex-1 truncate">{entry.siteName}</span>
            <span className="text-xs text-[#00d4ffcc]">{entry.minutes}m</span>
            <button
              onClick={() => removeManualEntry(entry.id!)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded"
            >
              <Trash2 size={10} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
