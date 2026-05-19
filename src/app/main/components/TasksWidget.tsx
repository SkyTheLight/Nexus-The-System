'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'

interface Task {
  id: number
  title: string
  completed: boolean
  priority: string | null
  created_at: string
}

export default function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const sb = getSupabase()
      if (!sb) throw new Error('No Supabase')
      const { data, error: err } = await sb
        .from('tasks')
        .select('id, title, completed, priority, created_at')
        .eq('completed', false)
        .order('priority', { ascending: false, nullsLast: true })
        .order('created_at', { ascending: true })
        .limit(3)
      if (err) throw err
      setTasks(data || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const toggleComplete = useCallback(async (id: number) => {
    try {
      const sb = getSupabase()
      if (!sb) return
      await sb.from('tasks').update({ completed: true }).eq('id', id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch {}
  }, [])

  const addTask = useCallback(async () => {
    const title = newTitle.trim()
    if (!title) return
    setAdding(true)
    try {
      const sb = getSupabase()
      if (!sb) return
      const { data } = await sb.from('tasks').insert({ title }).select('id, title, completed, priority, created_at').single()
      if (data) setTasks(prev => [...prev, data])
      setNewTitle('')
    } catch {} finally {
      setAdding(false)
    }
  }, [newTitle])

  if (loading) {
    return <div className="space-y-2"><div className="h-3 bg-[#1a1a2e] w-1/3 animate-pulse" /><div className="h-4 bg-[#1a1a2e] w-full animate-pulse" /><div className="h-4 bg-[#1a1a2e] w-3/4 animate-pulse" /></div>
  }
  if (error) {
    return (
      <>
        <div className="hud-card-header drag-handle">
          <span className="text-[clamp(7px,1.2cqw,9px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ DAILY OBJECTIVES</span>
          <span className="text-[clamp(6px,1cqw,8px)] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <button onClick={fetchTasks} className="font-mono text-[#d7b36a] hover:underline text-left" style={{ fontSize: 'clamp(8px,1.4cqw,10px)' }}>Retry ↗</button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[clamp(7px,1.2cqw,9px)] font-mono text-[#d7b36a] uppercase tracking-[0.25em]">■ DAILY OBJECTIVES</span>
        <span className="rc-hide-xs text-[clamp(6px,1cqw,8px)] font-mono text-[#22c55e] uppercase tracking-[0.15em]">
          {tasks.length === 0 ? 'ALL CLEAR' : `${tasks.length} ACTIVE`}
        </span>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 space-y-1.5">
          {tasks.length === 0 ? (
            <div className="font-mono text-[#22c55e]" style={{ fontSize: 'clamp(10px,2cqw,13px)' }}>OBJECTIVES COMPLETE. WELL DONE, HUNTER.</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 group"
                style={task.priority === 'high' ? { borderLeft: '2px solid #ef4444', paddingLeft: '6px' } : {}}
              >
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="border border-[#1a1a2e] hover:border-[#d7b36a] transition-colors duration-150 shrink-0 flex items-center justify-center font-mono text-[#6b5a30] group-hover:text-[#d7b36a]"
                  style={{ width: 'clamp(14px,2.5cqw,16px)', height: 'clamp(14px,2.5cqw,16px)', fontSize: 'clamp(8px,1.3cqw,10px)' }}
                >
                  [&nbsp;]
                </button>
                <span className="font-mono text-[#f7f1e4] truncate" style={{ fontSize: 'clamp(10px,1.8cqw,12px)' }}>{task.title}</span>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); addTask() }}
          className="rc-hide-sm mt-2 pt-2 border-t border-[#1a1a2e]"
        >
          <div className="flex items-center gap-1">
            <span className="font-mono text-[#6b5a30]" style={{ fontSize: 'clamp(8px,1.3cqw,10px)' }}>&gt;</span>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="ADD OBJECTIVE..."
              className="flex-1 bg-transparent border-none px-1 py-1 font-mono text-[#f7f1e4] placeholder:text-[#6b5a30] outline-none"
              style={{ fontSize: 'clamp(9px,1.5cqw,11px)' }}
              disabled={adding}
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || adding}
              className="font-mono text-[#6b5a30] hover:text-[#d7b36a] disabled:opacity-30 transition-colors uppercase tracking-[0.15em]"
              style={{ fontSize: 'clamp(7px,1.1cqw,9px)' }}
            >
              ADD
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
