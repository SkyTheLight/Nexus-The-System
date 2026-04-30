'use client'

import { useState, useEffect } from 'react'
import { Target, Plus } from 'lucide-react'
import { Goal } from '@/types'
import { getGoals, createGoal } from '@/lib/api'
import { CreateGoalModal } from '@/components/Modal'

export default function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    try {
      const data = await getGoals()
      setGoals(data)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createGoal(goal)
      loadGoals()
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Goals</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New Goal
          </button>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-card border border-border rounded-lg p-5 hover:border-accent-foreground/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-gray-300 mt-1">{goal.description}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${goal.type === 'short' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {goal.type} term
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${goal.progress}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{goal.progress}%</span>
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
    </>
  )
}
