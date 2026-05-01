'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface ScreenTimeEntry {
  id: string
  name: string
  category: 'app' | 'website'
  minutes: number
  date: string
}

export default function ScreenTimeWidget() {
  const [entries, setEntries] = useState<ScreenTimeEntry[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'app' | 'website'>('app')
  const [minutes, setMinutes] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadTodayData()
  }, [])

  function loadTodayData() {
    try {
      const saved = localStorage.getItem(`screentime-${today}`)
      if (saved) {
        setEntries(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load screen time:', e)
    }
  }

  function saveData(newEntries: ScreenTimeEntry[]) {
    setEntries(newEntries)
    localStorage.setItem(`screentime-${today}`, JSON.stringify(newEntries))
  }

  function addEntry() {
    if (!name.trim() || minutes <= 0) return

    const newEntry: ScreenTimeEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      category,
      minutes,
      date: today
    }

    const newEntries = [...entries, newEntry]
    saveData(newEntries)
    setName('')
    setMinutes(0)
    setShowForm(false)
  }

  function removeEntry(id: string) {
    const newEntries = entries.filter(e => e.id !== id)
    saveData(newEntries)
  }

  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Screen Time</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1 hover:bg-accent rounded"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Today's total */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">
          {totalHours}h {remainingMinutes}m
        </div>
        <div className="text-xs text-muted-foreground">Today</div>
      </div>

      {/* Add entry form */}
      {showForm && (
        <div className="mb-4 p-3 bg-accent/50 rounded-lg space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="App/Website name"
            className="w-full px-2 py-1 text-xs bg-background border border-border rounded"
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'app' | 'website')}
              className="flex-1 px-2 py-1 text-xs bg-background border border-border rounded"
            >
              <option value="app">App</option>
              <option value="website">Website</option>
            </select>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
              placeholder="Minutes"
              className="w-20 px-2 py-1 text-xs bg-background border border-border rounded"
            />
          </div>
          <button
            onClick={addEntry}
            className="w-full py-1 bg-primary text-primary-foreground text-xs rounded hover:opacity-90"
          >
            Add
          </button>
        </div>
      )}

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {entries.map(entry => (
          <div
            key={entry.id}
            className="flex items-center gap-2 p-2 hover:bg-accent rounded group"
          >
            <span className="text-xs">{entry.category === 'app' ? '📱' : '🌐'}</span>
            <span className="flex-1 text-xs truncate">{entry.name}</span>
            <span className="text-xs text-muted-foreground">{entry.minutes}m</span>
            <button
              onClick={() => removeEntry(entry.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded"
            >
              <Trash2 size={10} className="text-red-400" />
            </button>
          </div>
        ))}
        {entries.length === 0 && !showForm && (
          <div className="text-xs text-muted-foreground text-center py-4">
            No entries today
          </div>
        )}
      </div>
    </div>
  )
}
