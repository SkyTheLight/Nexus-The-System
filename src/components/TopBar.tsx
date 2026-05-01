'use client'

import { Search, Plus, AlertTriangle, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThemeSelector from './ThemeSelector'

export default function TopBar() {
  const [nextDeadline, setNextDeadline] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetch('/api/next-deadline')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setNextDeadline(data.data)
        }
      })
      .catch(() => {})

    const interval = setInterval(() => {
      if (nextDeadline) {
        const now = new Date()
        const deadline = new Date(nextDeadline.deadline)
        const diff = deadline.getTime() - now.getTime()
        
        if (diff <= 0) {
          setTimeLeft('Overdue')
          return
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h left`)
        } else {
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          setTimeLeft(`${minutes}m left`)
        }
      }
    }, 60000) // Update every minute;

    return () => clearInterval(interval)
  }, [nextDeadline])

  const handleSyncCanvas = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/canvas/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert(`Synced ${data.count} assignments!`)
      } else {
        alert('Sync failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error: any) {
      alert('Sync failed: ' + error.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <header className="h-16 border-b border-border bg-muted flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <button className="w-full flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-muted-foreground hover:border-accent-foreground/20 transition-colors">
          <Search size={16} />
          <span className="text-sm">Search anything...</span>
          <kbd className="ml-auto text-xs bg-accent px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {nextDeadline && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-700/50 rounded-lg">
            <AlertTriangle size={14} className="text-red-400" />
            <div className="text-xs">
              <div className="text-red-300 font-semibold truncate max-w-[150px]">{nextDeadline.title}</div>
              <div className="text-red-400">{timeLeft}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleSyncCanvas}
          disabled={syncing}
          className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-opacity disabled:opacity-50"
          title="Sync Canvas assignments"
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
        </button>

        <ThemeSelector />
        <button className="ml-4 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <Plus size={18} />
        </button>
      </div>
    </header>
  )
}
