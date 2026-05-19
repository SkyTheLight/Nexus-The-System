'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'

const PIN_CACHE_KEY = 'adversity-pinned-items'

interface PinnableItem {
  id: number
  title: string
  content: string
  type: 'note' | 'idea'
  created_at: string
}

export default function PinnedWidget() {
  const [items, setItems] = useState<PinnableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<PinnableItem | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const sb = getSupabase()
      if (!sb) throw new Error('No Supabase')

      const [notesRes, ideasRes] = await Promise.all([
        sb.from('notes').select('id, title, content, created_at').order('created_at', { ascending: false }).limit(10),
        sb.from('ideas').select('id, title, description, created_at').order('created_at', { ascending: false }).limit(10),
      ])

      const pinnedIds: Record<string, number[]> = { note: [], idea: [] }
      try {
        const raw = localStorage.getItem(PIN_CACHE_KEY)
        if (raw) Object.assign(pinnedIds, JSON.parse(raw))
      } catch {}

      const notes = (notesRes.data || []).map((n: any) => ({ id: n.id, title: n.title, content: n.content || '', type: 'note' as const, created_at: n.created_at }))
      const ideas = (ideasRes.data || []).map((i: any) => ({ id: i.id, title: i.title, content: i.description || '', type: 'idea' as const, created_at: i.created_at }))

      const allItems = [...notes, ...ideas]
      const pinnedNoteIds = new Set(pinnedIds.note || [])
      const pinnedIdeaIds = new Set(pinnedIds.idea || [])

      const mapped = allItems.filter(item =>
        (item.type === 'note' && pinnedNoteIds.has(item.id)) ||
        (item.type === 'idea' && pinnedIdeaIds.has(item.id))
      )

      setItems(mapped.length > 0 ? mapped : allItems.slice(0, 5))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const togglePin = useCallback((item: PinnableItem) => {
    setItems(prev => {
      const exists = prev.some(p => p.id === item.id && p.type === item.type)
      if (exists) {
        const next = prev.filter(p => !(p.id === item.id && p.type === item.type))
        updatePinCache(item, false)
        if (next.length === 0) fetchItems()
        return next
      }
      updatePinCache(item, true)
      return [item, ...prev]
    })
  }, [fetchItems])

  function updatePinCache(item: PinnableItem, pin: boolean) {
    try {
      const raw = localStorage.getItem(PIN_CACHE_KEY)
      const pinnedIds: Record<string, number[]> = raw ? JSON.parse(raw) : { note: [], idea: [] }
      const key = item.type === 'note' ? 'note' : 'idea'
      const set = new Set(pinnedIds[key] || [])
      if (pin) set.add(item.id)
      else set.delete(item.id)
      pinnedIds[key] = Array.from(set)
      localStorage.setItem(PIN_CACHE_KEY, JSON.stringify(pinnedIds))
    } catch {}
  }

  const firstLine = (text: string) => text.split('\n')[0].slice(0, 80)

  if (loading) {
    return <div className="space-y-2"><div className="h-3 bg-[#12121c] w-1/4 animate-pulse" /><div className="h-8 bg-[#12121c] w-full animate-pulse" /><div className="h-8 bg-[#12121c] w-3/4 animate-pulse" /></div>
  }
  if (error) {
    return (
      <>
<div className="hud-card-header drag-handle">
          <span className="text-[clamp(7px,1.2cqw,9px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ INTEL BOARD</span>
          <span className="text-[clamp(6px,1cqw,8px)] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <button onClick={fetchItems} className="font-mono text-[#d7b36a] hover:underline text-left mt-2" style={{ fontSize: 'clamp(8px,1.4cqw,10px)' }}>Retry ↗</button>
      </>
    )
  }

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[clamp(7px,1.2cqw,9px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ INTEL BOARD</span>
        <span className="text-[clamp(6px,1cqw,8px)] font-mono text-[#22c55e] uppercase tracking-[0.15em]">{items.length} ITEMS</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {items.length === 0 ? (
          <div className="font-mono text-[#6b5a30]" style={{ fontSize: 'clamp(9px,1.5cqw,11px)' }}>&gt; NO INTEL PINNED. ACCESS HUB TO PIN INTEL.</div>
        ) : (
          items.map(item => (
            <div key={`${item.type}-${item.id}`}>
              <button
                onClick={() => setSelected(item)}
                className="w-full text-left border-l-2 border-[#7c3aed] pl-2 py-1.5 hover:bg-[#111124] transition-colors duration-150"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[#f7f1e4] truncate" style={{ fontSize: 'clamp(10px,1.8cqw,12px)' }}>{item.title}</span>
                  <span className="font-mono text-[#6b5a30] uppercase tracking-[0.15em] shrink-0" style={{ fontSize: 'clamp(6px,1cqw,8px)' }}>{item.type}</span>
                </div>
                {item.content && (
                  <div className="font-mono text-[#6b5a30] mt-0.5 truncate" style={{ fontSize: 'clamp(9px,1.4cqw,11px)' }}>{firstLine(item.content)}</div>
                )}
              </button>
              <button
                onClick={() => togglePin(item)}
                className="font-mono text-[#6b5a30] hover:text-[#7c3aed] transition-colors mt-0.5 ml-2 uppercase tracking-[0.15em]"
                style={{ fontSize: 'clamp(6px,1cqw,8px)' }}
              >
                {items.some(p => p.id === item.id && p.type === item.type) ? '[ unpin ]' : '[ pin ]'}
              </button>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-[#0b0b13] border border-[rgba(215,179,106,0.22)] p-5 max-w-lg w-full mx-4 max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">{selected.type}</span>
                <span className="text-[9px] font-mono text-[#6b5a30]">#{selected.id}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#6b5a30] hover:text-[#f7f1e4] text-sm font-mono transition-colors">[x]</button>
            </div>
            <h2 className="text-[14px] font-mono font-bold text-[#f7f1e4] mb-3">{selected.title}</h2>
            <div className="text-[12px] font-mono text-[#6b5a30] leading-relaxed whitespace-pre-wrap">{selected.content}</div>
            <button
              onClick={() => { togglePin(selected); setSelected(null) }}
              className="mt-4 text-[9px] font-mono text-[#6b5a30] hover:text-[#7c3aed] transition-colors uppercase tracking-[0.15em]"
            >
              {items.some(p => p.id === selected.id && p.type === selected.type) ? '[ unpin ]' : '[ pin ]'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
