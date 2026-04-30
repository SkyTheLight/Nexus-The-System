'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Plus, Circle, CheckCircle2 } from 'lucide-react'
import { Task } from '@/types'
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/api'
import { CreateTaskModal } from '@/components/Modal'
import DescriptionModal from '@/components/DescriptionModal'

export default function TodoWidget() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all')
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Task | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      await updateTask(task.id, { status: newStatus })
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function handleCreate(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createTask(task)
      loadTasks()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">To-Do</h1>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {(['all', 'todo', 'in-progress', 'done'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    filter === f ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-accent-foreground/20 transition-colors cursor-pointer"
              onClick={() => setSelectedItem(task)}
            >
              {task.status === 'done' ? (
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              ) : (
                <Circle size={18} className="text-muted-foreground shrink-0" />
              )}
              <span className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </span>
              {task.description && (
                <span className="text-xs text-gray-300 truncate max-w-xs">{task.description}</span>
              )}
              <span
                className={`text-xs px-2 py-1 rounded ${
                  task.priority === 'high'
                    ? 'bg-red-500/10 text-red-500'
                    : task.priority === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-blue-500/10 text-blue-500'
                }`}
              >
                {task.priority}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleStatus(task) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-accent rounded"
              >
                {task.status === 'done' ? 'Undo' : 'Done'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
      <DescriptionModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
        description={selectedItem?.description || ''}
        status={selectedItem?.status}
        extra={selectedItem ? [
          { label: 'Priority', value: selectedItem.priority },
          { label: 'Status', value: selectedItem.status },
        ] : []}
      />
    </>
  )
}
