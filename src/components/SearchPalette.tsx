'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Hash, FileText, Target, Lightbulb, Music as MusicIcon, Code, Trophy, CheckSquare } from 'lucide-react'
import Fuse from 'fuse.js'
import type { SearchableItem } from '@/lib/search'
import { getSectionLabel } from '@/lib/search'
import type { Task, Idea, Goal, Certificate, Note, Music, DevEntry, PerformanceEntry } from '@/types'

interface SearchPaletteProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  ideas: Idea[]
  goals: Goal[]
  certificates: Certificate[]
  notes: Note[]
  music: Music[]
  devEntries: DevEntry[]
  performanceEntries: PerformanceEntry[]
  onSelect: (item: SearchableItem) => void
}

const iconMap: Record<SearchableItem['type'], React.ReactNode> = {
  task: <CheckSquare size={16} className="text-blue-400" />,
  idea: <Lightbulb size={16} className="text-yellow-400" />,
  goal: <Target size={16} className="text-green-400" />,
  certificate: <Trophy size={16} className="text-amber-400" />,
  note: <FileText size={16} className="text-purple-400" />,
  music: <MusicIcon size={16} className="text-pink-400" />,
  dev: <Code size={16} className="text-cyan-400" />,
  performance: <Trophy size={16} className="text-orange-400" />,
}

const colorMap: Record<SearchableItem['type'], string> = {
  task: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  idea: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  goal: 'bg-green-500/10 text-green-400 border-green-500/20',
  certificate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  note: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  music: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  dev: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  performance: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

export function SearchPalette({
  isOpen,
  onClose,
  tasks,
  ideas,
  goals,
  certificates,
  notes,
  music,
  devEntries,
  performanceEntries,
  onSelect,
}: SearchPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchItems = useMemo<SearchableItem[]>(() => {
    return [
      ...tasks.map((t) => ({ type: 'task' as const, data: t })),
      ...ideas.map((i) => ({ type: 'idea' as const, data: i })),
      ...goals.map((g) => ({ type: 'goal' as const, data: g })),
      ...certificates.map((c) => ({ type: 'certificate' as const, data: c })),
      ...notes.map((n) => ({ type: 'note' as const, data: n })),
      ...music.map((m) => ({ type: 'music' as const, data: m })),
      ...devEntries.map((d) => ({ type: 'dev' as const, data: d })),
      ...performanceEntries.map((p) => ({ type: 'performance' as const, data: p })),
    ]
  }, [tasks, ideas, goals, certificates, notes, music, devEntries, performanceEntries])

  const fuse = useMemo(() => {
    return new Fuse(searchItems, {
      keys: [
        { name: 'data.title', weight: 0.4 },
        { name: 'data.name', weight: 0.4 },
        { name: 'data.description', weight: 0.2 },
        { name: 'data.content', weight: 0.1 },
        { name: 'data.notes', weight: 0.1 },
      ],
      threshold: 0.3,
      includeMatches: true,
      includeScore: true,
    })
  }, [searchItems])

  const results = useMemo(() => {
    if (!query.trim()) return searchItems.slice(0, 50)
    return fuse.search(query).map((r) => r.item)
  }, [query, searchItems, fuse])

  // Group by type
  const grouped = useMemo(() => {
    const groups: Record<string, SearchableItem[]> = {}
    results.forEach((item) => {
      const key = item.type
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }, [results])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Toggle handled by parent
        }
      }
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        onSelect(results[activeIndex])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, results, activeIndex, onSelect])

  const getItemTitle = (item: SearchableItem): string => {
    switch (item.type) {
      case 'task':
        return (item.data as Task).title || 'Untitled'
      case 'idea':
        return (item.data as Idea).name || 'Untitled'
      case 'goal':
        return (item.data as Goal).title || 'Untitled'
      case 'certificate':
        return (item.data as Certificate).title || 'Untitled'
      case 'note':
        return (item.data as Note).title || 'Untitled'
      case 'music':
        return (item.data as Music).title || 'Untitled'
      case 'dev':
        return (item.data as DevEntry).title || 'Untitled'
      case 'performance':
        return (item.data as PerformanceEntry).title || 'Untitled'
      default:
        return 'Untitled'
    }
  }

  const getItemDesc = (item: SearchableItem): string => {
    switch (item.type) {
      case 'task':
        return (item.data as Task).description || ''
      case 'idea':
        return (item.data as Idea).description || ''
      case 'goal':
        return (item.data as Goal).description || ''
      case 'certificate':
        return (item.data as Certificate).notes || ''
      case 'note':
        return (item.data as Note).content || ''
      case 'music':
        return (item.data as Music).link || ''
      case 'dev':
        return (item.data as DevEntry).content || ''
      case 'performance':
        return (item.data as PerformanceEntry).notes || ''
      default:
        return ''
    }
  }

  if (!isOpen) return null

  let globalIndex = 0

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-[100] pt-[20vh] animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Hash size={18} className="text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, ideas, notes, goals..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-surface-2 rounded-md text-xs text-muted-foreground border border-border">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="mb-4 last:mb-0">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {getSectionLabel(type as SearchableItem['type'])} ({items.length})
              </div>
              {items.map((item) => {
                const idx = globalIndex++
                return (
                  <button
                    key={`${item.type}-${item.data.id}`}
                    onClick={() => onSelect(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-150 ${
                      idx === activeIndex
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border ${colorMap[item.type]}`}>
                      {iconMap[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{getItemTitle(item)}</div>
                      {getItemDesc(item) && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {getItemDesc(item)}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[item.type]}`}>
                      {type}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
          {results.length === 0 && query.trim() && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
