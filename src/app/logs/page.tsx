'use client'

import { useState, useEffect } from 'react'
import { getLogs, restoreFromLog, clearLogs } from '@/lib/logs'
import type { LogItem } from '@/lib/logs'
import { Trash2, RotateCcw, Trash } from 'lucide-react'
import Link from 'next/link'

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    try {
      const data = await getLogs()
      setLogs(data)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRestore(log: LogItem) {
    try {
      await restoreFromLog(log.id!, log.data, log.type)
      loadLogs()
    } catch (error) {
      console.error('Error restoring item:', error)
    }
  }

  async function handleClearAll() {
    if (!confirm('Clear all logs? This cannot be undone.')) return
    try {
      await clearLogs()
      loadLogs()
    } catch (error) {
      console.error('Error clearing logs:', error)
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      task: 'bg-blue-500/10 text-blue-400',
      goal: 'bg-purple-500/10 text-purple-400',
      idea: 'bg-yellow-500/10 text-yellow-400',
      certificate: 'bg-green-500/10 text-green-400',
      note: 'bg-pink-500/10 text-pink-400',
      music: 'bg-indigo-500/10 text-indigo-400',
      dev: 'bg-orange-500/10 text-orange-400',
      performance: 'bg-red-500/10 text-red-400',
    }
    return colors[type] || 'bg-gray-500/10 text-gray-400'
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Logs</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
          >
            <Trash size={16} />
            Clear All
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
          >
            <RotateCcw size={16} />
            Back to Focus Board
          </Link>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20">
          <Trash2 size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No deleted items</p>
          <p className="text-sm text-muted-foreground mt-2">Items you delete will appear here for backup</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-accent-foreground/20 transition-colors">
              <div className={`px-3 py-1 rounded-lg text-xs ${getTypeColor(log.type)}`}>
                {log.type}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{log.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Deleted: {new Date(log.deleted_at!).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleRestore(log)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
              >
                <RotateCcw size={16} />
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { }
