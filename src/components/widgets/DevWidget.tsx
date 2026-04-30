'use client'

import { useState, useEffect } from 'react'
import { Code, Plus, Trash2 } from 'lucide-react'
import { getDevEntries, createDevEntry, deleteDevEntry, getSB } from '@/lib/api'
import { addLog } from '@/lib/logs'
import type { DevEntry } from '@/types'
import { CreateDevEntryModal } from '@/components/Modal'
import DescriptionModal from '@/components/DescriptionModal'

export default function DevWidget() {
  const [entries, setEntries] = useState<DevEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DevEntry | null>(null)

  useEffect(() => { 
    loadEntries() 
    
    // Poll every 3 seconds to catch AI-created items
    const interval = setInterval(() => {
      loadEntries()
    }, 3000)
    
    return () => { clearInterval(interval) }
  }, [])

  async function loadEntries() {
    try {
      const data = await getDevEntries()
      setEntries(data.slice(0, 5))
    } catch { } finally { setLoading(false) }
  }

  async function removeEntry(id: string) {
    try {
      const entry = entries.find(e => e.id === id)
      if (entry) {
        await addLog({ original_id: id, type: 'dev', title: entry.title, description: entry.content, data: entry })
      }
      await deleteDevEntry(id)
      loadEntries()
    } catch { }
  }

  async function handleCreate(entry: Omit<DevEntry, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createDevEntry(entry)
      loadEntries()
    } catch { }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Dev Mode</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 hover:bg-accent rounded"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {entries.map(entry => (
            <div key={entry.id} className="p-2 hover:bg-accent rounded group flex items-center justify-between cursor-pointer" onClick={() => setSelectedItem(entry)}>
              <span className="text-xs flex-1">{entry.title}</span>
              <span className="text-xs bg-accent px-1.5 py-0.5 rounded mr-2">{entry.type}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeEntry(entry.id) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <CreateDevEntryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
      <DescriptionModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
        description={selectedItem?.content || ''}
        type={selectedItem?.type || ''}
        extra={selectedItem ? [
          { label: 'Type', value: selectedItem.type },
        ] : []}
      />
    </>
  )
}
