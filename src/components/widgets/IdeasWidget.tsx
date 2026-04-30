'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Plus, Trash2 } from 'lucide-react'
import { getIdeas, createIdea, deleteIdea, getSB } from '@/lib/api'
import { addLog } from '@/lib/logs'
import type { Idea } from '@/types'
import { CreateIdeaModal } from '@/components/Modal'
import DescriptionModal from '@/components/DescriptionModal'

export default function IdeasWidget() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Idea | null>(null)

  useEffect(() => { 
    loadIdeas() 
    
    // Poll every 3 seconds to catch AI-created items
    const interval = setInterval(() => {
      loadIdeas()
    }, 3000)
    
    return () => { clearInterval(interval) }
  }, [])

  async function loadIdeas() {
    try {
      const data = await getIdeas()
      setIdeas(data.slice(0, 5))
    } catch { } finally { setLoading(false) }
  }

  async function removeIdea(id: string) {
    try {
      const idea = ideas.find(i => i.id === id)
      if (idea) {
        await addLog({ original_id: id, type: 'idea', title: idea.name, description: idea.description, data: idea })
      }
      await deleteIdea(id)
      loadIdeas()
    } catch { }
  }

  async function handleCreate(idea: Omit<Idea, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createIdea(idea)
      loadIdeas()
    } catch { }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">App Ideas</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 hover:bg-accent rounded"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {ideas.map(idea => (
            <div key={idea.id} className="p-2 hover:bg-accent rounded group flex items-start justify-between cursor-pointer" onClick={() => setSelectedItem(idea)}>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{idea.name}</span>
                  <span className="text-xs bg-accent px-1.5 py-0.5 rounded">{idea.status}</span>
                </div>
                {idea.description && (
                  <p className="text-xs text-gray-300 truncate mt-0.5">{idea.description}</p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeIdea(idea.id) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded ml-2"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <CreateIdeaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
      <DescriptionModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name || ''}
        description={selectedItem?.description || ''}
        type={selectedItem?.category || ''}
        status={selectedItem?.status}
        extra={selectedItem ? [
          { label: 'Category', value: selectedItem.category },
          { label: 'Potential Score', value: `${selectedItem.potential_score}/10` },
        ] : []}
      />
    </>
  )
}
