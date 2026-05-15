'use client'

import { useState, useEffect } from 'react'
import { getNotes } from '@/lib/api'
import type { Note } from '@/types'
import { FileText } from 'lucide-react'

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function FocusNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotes(data.slice(0, 3))
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="widget-card min-h-[200px]">
        <div className="widget-card-header">
          <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
              <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="widget-card min-h-[200px]">
      <div className="widget-card-header">
        <span className="widget-card-title">Recent Notes</span>
      </div>
      <div className="space-y-2">
        {notes.length === 0 && (
          <div className="text-xs text-[var(--color-text-muted)] py-6 text-center">
            No notes yet — Create one from the Notes page
          </div>
        )}
        {notes.map(note => (
          <div key={note.id} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-start gap-2">
              <FileText size={14} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{note.title}</p>
                {note.content && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">{note.content}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {note.category && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-dim)] text-[var(--color-accent)]">
                  {note.category}
                </span>
              )}
              <span className="text-[10px] text-[var(--color-text-muted)]">{timeAgo(note.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
