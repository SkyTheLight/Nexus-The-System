'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Plus, TrendingUp } from 'lucide-react'
import { Idea } from '@/types'
import { getIdeas, createIdea } from '@/lib/api'
import { CreateIdeaModal } from '@/components/Modal'

export default function IdeasList() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    loadIdeas()
  }, [])

  async function loadIdeas() {
    try {
      const data = await getIdeas()
      setIdeas(data)
    } catch (error) {
      console.error('Error loading ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(idea: Omit<Idea, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createIdea(idea)
      loadIdeas()
    } catch (error) {
      console.error('Error creating idea:', error)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">App Ideas</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New Idea
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-card border border-border rounded-lg p-5 hover:border-accent-foreground/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{idea.name}</h3>
                <span className="text-xs bg-accent px-2 py-1 rounded">{idea.category}</span>
              </div>
              {idea.description && (
                <p className="text-sm text-gray-300 mb-4">{idea.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  idea.status === 'building' ? 'bg-green-500/10 text-green-500' : 'bg-accent text-muted-foreground'
                }`}>
                  {idea.status}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{idea.potential_score}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CreateIdeaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
