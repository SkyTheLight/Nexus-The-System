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
<div className="hud-card-header main-drag-handle">
          <span className="text-[9px] font-mono text-[#00aaff] uppercase tracking-[0.25em]">■ DAILY OBJECTIVES</span>
          <span className="text-[8px] font-mono text-[#ef4444] uppercase tracking-[0.15em]">ERROR</span>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <button onClick={fetchTasks} className="text-[10px] font-mono text-[#00aaff] hover:underline text-left">Retry ↗</button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="hud-card-header">
        <span className="text-[9px] font-mono text-[#00aaff] uppercase tracking-[0.25em]">■ DAILY OBJECTIVES</span>
        <span className="text-[8px] font-mono text-[#10b981] uppercase tracking-[0.15em]">
          {tasks.length === 0 ? 'ALL CLEAR' : `${tasks.length} ACTIVE`}
        </span>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 space-y-1.5">
          {tasks.length === 0 ? (
            <div className="text-[13px] font-mono text-[#10b981]">OBJECTIVES COMPLETE. WELL DONE, HUNTER.</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 group"
                style={task.priority === 'high' ? { borderLeft: '2px solid #ef4444', paddingLeft: '6px' } : {}}
              >
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="w-4 h-4 border border-[#1a1a2e] hover:border-[#00aaff] transition-colors duration-150 shrink-0 flex items-center justify-center font-mono text-[10px] text-[#4a5568] group-hover:text-[#e2e8f0]"
                >
                  [&nbsp;]
                </button>
                <span className="text-[12px] font-mono text-[#e2e8f0] truncate">{task.title}</span>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); addTask() }}
          className="mt-2 pt-2 border-t border-[#1a1a2e]"
        >
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-[#4a5568]">&gt;</span>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="ADD OBJECTIVE..."
              className="flex-1 bg-transparent border-none px-1 py-1 text-[11px] font-mono text-[#e2e8f0] placeholder:text-[#4a5568] outline-none"
              disabled={adding}
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || adding}
              className="text-[9px] font-mono text-[#4a5568] hover:text-[#00aaff] disabled:opacity-30 transition-colors uppercase tracking-[0.15em]"
            >
              ADD
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
