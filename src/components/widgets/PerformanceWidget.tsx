'use client'

import { useState, useEffect } from 'react'
import { Gamepad2, Plus, Trash2 } from 'lucide-react'
import { getPerformanceEntries, createPerformanceEntry, deletePerformanceEntry, getSB } from '@/lib/api'
import { addLog } from '@/lib/logs'
import type { PerformanceEntry } from '@/types'
import { CreatePerformanceEntryModal } from '@/components/Modal'
import DescriptionModal from '@/components/DescriptionModal'

export default function PerformanceWidget() {
  const [entries, setEntries] = useState<PerformanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PerformanceEntry | null>(null)

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
      const data = await getPerformanceEntries()
      setEntries(data.slice(0, 5))
    } catch { } finally { setLoading(false) }
  }

  async function removeEntry(id: string) {
    try {
      const entry = entries.find(e => e.id === id)
      if (entry) {
        await addLog({ original_id: id, type: 'performance', title: entry.title, description: entry.notes, data: entry })
      }
      await deletePerformanceEntry(id)
      loadEntries()
    } catch { }
  }

  async function handleCreate(entry: Omit<PerformanceEntry, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createPerformanceEntry(entry)
      loadEntries()
    } catch { }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Performance</h3>
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
      <CreatePerformanceEntryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
      <DescriptionModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
        description={selectedItem?.notes || ''}
        type={selectedItem?.game || ''}
        extra={selectedItem ? [
          { label: 'Game', value: selectedItem.game || '' },
          { label: 'Sensitivity', value: selectedItem.sensitivity || '' },
        ] : []}
      />
    </>
  )
}
