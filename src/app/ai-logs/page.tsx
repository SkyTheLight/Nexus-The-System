'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import BackButton from '@/components/BackButton'

interface AILog {
  id: number
  user_message: string
  ai_response: string
  model: string
  created_at: string
}

export default function AILogsPage() {
  const [logs, setLogs] = useState<AILog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function loadLogs() {
    try {
      const res = await fetch('/api/ai-logs')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setLogs(data || [])
    } catch (e) {
      console.error('Failed to load AI logs:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const deleteLog = async (id: number) => {
    if (!confirm('Delete this AI conversation?')) return
    
    setDeletingId(id)
    try {
      const res = await fetch(`/api/ai-logs?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      loadLogs()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const clearAll = async () => {
    if (!confirm('Delete ALL AI conversation logs? This cannot be undone.')) return
    
    try {
      const res = await fetch('/api/ai-logs?all=true', { method: 'DELETE' })
      if (!res.ok) throw new Error('Clear all failed')
      loadLogs()
    } catch (error) {
      console.error('Clear all error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar spacer */}
        <div className="w-64 flex-shrink-0" />
        
        <main className="flex-1 ml-64 p-8">
          <BackButton />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              AI Conversation Logs
            </h1>
            <p className="text-gray-300 mt-2">ARISE learning memory</p>
          </div>

          {/* Actions */}
          {logs && logs.length > 0 && (
            <div className="mb-6">
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
              >
                Clear All Logs
              </button>
            </div>
          )}

          {/* Logs List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-white/5 rounded w-full mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="bg-[#0B0B0C] border border-white/10 rounded-2xl p-6 relative group">
                  <button
                    onClick={() => deleteLog(log.id)}
                    disabled={deletingId === log.id}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-blue-400">You</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{log.user_message}</p>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-purple-400">ARISE</span>
                      <span className="text-xs text-muted-foreground">{log.model}</span>
                    </div>
                    <p className="text-sm text-gray-300">{log.ai_response}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-muted-foreground">No AI conversations yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start chatting with ARISE to build its memory!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
