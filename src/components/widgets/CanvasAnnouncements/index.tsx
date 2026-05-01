'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

interface Announcement {
  id: number
  title: string
  message: string
  html_url: string
  created_at: string
  course_name?: string
}

export default function CanvasAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetchAnnouncements()
    const interval = setInterval(fetchAnnouncements, 3000)
    return () => clearInterval(interval)
  }, [mounted])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/canvas/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (!mounted) return <div className="text-muted-foreground text-sm p-4">Loading...</div>
  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading announcements...</div>

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <ExternalLink size={14} />
          Canvas Announcements
        </h3>
        <button
          onClick={fetchAnnouncements}
          className="p-1 hover:bg-gray-700 rounded"
          title="Refresh"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {announcements.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No announcements yet</p>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors"
            >
              <div
                className="cursor-pointer"
                onClick={() => toggleExpand(announcement.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{announcement.title}</h4>
                    {announcement.course_name && (
                      <span className="text-xs text-blue-400">{announcement.course_name}</span>
                    )}
                  </div>
                  {expandedId === announcement.id ? (
                    <ChevronUp size={14} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>

              {expandedId === announcement.id && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-300 whitespace-pre-wrap">
                    {stripHtml(announcement.message)}
                  </p>
                  <a
                    href={announcement.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Canvas <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
