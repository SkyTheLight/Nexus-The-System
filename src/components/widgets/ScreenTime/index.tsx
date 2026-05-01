'use client'

import { useState, useEffect } from 'react'
import { Monitor, Clock, Plus, Trash2, BarChart3 } from 'lucide-react'

interface ScreenTimeEntry {
  app: string
  duration: number // in minutes
  category: 'productive' | 'social' | 'entertainment' | 'other'
}

const CATEGORY_COLORS = {
  productive: 'bg-green-500',
  social: 'bg-blue-500',
  entertainment: 'bg-purple-500',
  other: 'bg-gray-500',
}

const CATEGORY_LABELS = {
  productive: 'Productive',
  social: 'Social',
  entertainment: 'Entertainment',
  other: 'Other',
}

export default function ScreenTimeWidget() {
  const [screenTime, setScreenTime] = useState<ScreenTimeEntry[]>([])
  const [totalTime, setTotalTime] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newApp, setNewApp] = useState('')
  const [newDuration, setNewDuration] = useState('')
  const [newCategory, setNewCategory] = useState<'productive' | 'social' | 'entertainment' | 'other'>('productive')

  useEffect(() => {
    setMounted(true)
    
    // Load today's screen time from localStorage
    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`screentime-${today}`)
    
    if (saved) {
      const data = JSON.parse(saved)
      setScreenTime(data.entries || [])
      setTotalTime(data.total || 0)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!mounted) return
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`screentime-${today}`, JSON.stringify({
      entries: screenTime,
      total: totalTime,
    }))
  }, [screenTime, totalTime, mounted])

  const addEntry = () => {
    if (!newApp || !newDuration) return
    
    const duration = parseInt(newDuration)
    if (isNaN(duration) || duration <= 0) return

    const newEntry: ScreenTimeEntry = {
      app: newApp,
      duration,
      category: newCategory,
    }

    setScreenTime(prev => [...prev, newEntry])
    setTotalTime(prev => prev + duration)
    
    // Reset form
    setNewApp('')
    setNewDuration('')
    setShowAddForm(false)
  }

  const removeEntry = (index: number) => {
    const entry = screenTime[index]
    setScreenTime(prev => prev.filter((_, i) => i !== index))
    setTotalTime(prev => prev - entry.duration)
  }

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  const maxDuration = Math.max(...screenTime.map(e => e.duration), 1)

  if (!mounted) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-blue-400" />
          <h3 className="font-semibold text-sm">Screen Time</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 hover:bg-gray-700 rounded"
          title="Add app"
        >
          <Plus size={12} />
        </button>
      </div>

      <div className="mb-3 text-center">
        <div className="text-2xl font-bold text-white">{formatTime(totalTime)}</div>
        <div className="text-xs text-gray-400">Today's total (manual)</div>
      </div>

      {showAddForm && (
        <div className="mb-3 p-2 bg-gray-800/50 rounded-lg space-y-2">
          <input
            type="text"
            placeholder="App name"
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Minutes"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="flex-1 px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
              min="1"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="productive">Productive</option>
              <option value="social">Social</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            onClick={addEntry}
            className="w-full py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto">
        {screenTime.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No apps tracked yet. Click + to add.</p>
        ) : (
          screenTime.map((entry, idx) => (
            <div key={idx} className="space-y-1 group">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate flex-1">{entry.app}</span>
                <span className="text-gray-400 mx-2">{formatTime(entry.duration)}</span>
                <button
                  onClick={() => removeEntry(idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} className="text-red-400" />
                </button>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${CATEGORY_COLORS[entry.category]} transition-all duration-500`}
                  style={{ width: `${(entry.duration / maxDuration) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {screenTime.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-4 text-xs text-gray-400">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded ${CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS]}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
