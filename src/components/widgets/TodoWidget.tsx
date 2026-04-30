'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/api'
import { addLog } from '@/lib/logs'
import type { Task } from '@/types'
import { CreateTaskModal } from '@/components/Modal'
import { addXpGlobal } from '@/hooks/useXp'

export default function TodoWidget() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<Date>(new Date())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  async function loadTasks() {
    try {
      console.log('TodoWidget: Fetching tasks...')
      const data = await getTasks()
      console.log('TodoWidget: Got', data?.length || 0, 'tasks:', data)
      setTasks(data || [])
      setLastFetch(new Date())
    } catch (e) {
      console.error('TodoWidget: Failed to load tasks:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadTasks()
    
    // Poll every 3 seconds to catch AI-created items
    const interval = setInterval(() => {
      loadTasks()
    }, 3000)
    
    return () => { clearInterval(interval) }
  }, [])

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      await updateTask(task.id, { status: newStatus })
      if (newStatus === 'done') {
        addXpGlobal(20) // +20 XP for completing a task
      }
      loadTasks()
    } catch (e) { console.error('Toggle failed:', e) }
  }

  async function removeTask(id: string) {
    try {
      const task = tasks.find(t => t.id === id)
      if (task) {
        await addLog({ original_id: id, type: 'task', title: task.title, description: task.description, data: task })
      }
      await deleteTask(id)
      loadTasks()
    } catch (e) { console.error('Delete failed:', e) }
  }

  async function handleCreate(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createTask(task)
      loadTasks()
    } catch (e) { console.error('Create failed:', e) }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>
  

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">To-Do</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 hover:bg-accent rounded"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-2 p-2 hover:bg-accent rounded group"
            >
              <div onClick={() => toggleTask(task)} className="flex items-center gap-2 flex-1 cursor-pointer">
                {task.status === 'done' ? (
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                ) : (
                  <Circle size={14} className="text-muted-foreground shrink-0 group-hover:text-foreground" />
                )}
                <span className={`text-xs flex-1 ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeTask(task.id) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {tasks.filter(t => t.status !== 'done').length} remaining
        </div>
      </div>
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
