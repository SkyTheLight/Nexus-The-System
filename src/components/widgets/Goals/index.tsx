'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, Trash2 } from 'lucide-react'
import { getGoals, createGoal, updateGoal, deleteGoal, getSB } from '@/lib/api'
import { addLog } from '@/lib/logs'
import type { Goal } from '@/types'
import { CreateGoalModal } from '@/components/Modal'
import DescriptionModal from '@/components/DescriptionModal'
import { addXpGlobal } from '@/hooks/useXp'

export default function GoalsWidget() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Goal | null>(null)

  useEffect(() => { 
    loadGoals() 
    
    // Poll every 3 seconds to catch AI-created items
    const interval = setInterval(() => {
      loadGoals()
    }, 3000)
    
    return () => { clearInterval(interval) }
  }, [])

  async function loadGoals() {
    try {
      const data = await getGoals()
      setGoals(data.slice(0, 3))
    } catch { } finally { setLoading(false) }
  }

  async function removeGoal(id: string) {
    try {
      const goal = goals.find(g => g.id === id)
      if (goal) {
        await addLog({ original_id: id, type: 'goal', title: goal.title, description: goal.description, data: goal })
      }
      await deleteGoal(id)
      loadGoals()
    } catch { }
  }

  async function toggleGoalCompletion(goal: Goal) {
    if (goal.progress === 100) {
      addXpGlobal(50) // +50 XP for completing a goal
    }
    await updateGoal(goal.id, { progress: goal.progress === 100 ? 0 : 100 })
    loadGoals()
  }

  async function handleCreate(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createGoal(goal)
      loadGoals()
    } catch { }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Goals</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 hover:bg-accent rounded"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 space-y-3">
          {goals.map(goal => (
            <div key={goal.id} className="group relative cursor-pointer" onClick={() => setSelectedItem(goal)}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{goal.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeGoal(goal.id) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
              {goal.description && (
                <p className="text-xs text-gray-300 truncate mb-1">{goal.description}</p>
              )}
              <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
      <DescriptionModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
        description={selectedItem?.description || ''}
        type={selectedItem?.type || ''}
        status={selectedItem ? `${selectedItem.progress}% complete` : ''}
        extra={selectedItem ? [
          { label: 'Type', value: selectedItem.type },
          { label: 'Progress', value: `${selectedItem.progress}%` },
        ] : []}
      />
    </>
  )
}
