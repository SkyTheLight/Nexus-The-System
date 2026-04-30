'use client'

import { useState, useEffect } from 'react'
import { Code, Plus, Copy } from 'lucide-react'
import { DevEntry } from '@/types'
import { getDevEntries, createDevEntry } from '@/lib/api'
import { CreateDevEntryModal } from '@/components/Modal'

export default function DevMode() {
  const [entries, setEntries] = useState<DevEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    try {
      const data = await getDevEntries()
      setEntries(data)
    } catch (error) {
      console.error('Error loading dev entries:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(entry: Omit<DevEntry, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createDevEntry(entry)
      loadEntries()
    } catch (error) {
      console.error('Error creating entry:', error)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dev Mode</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New Entry
          </button>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-accent-foreground/20 transition-colors">
              <Code size={18} className="text-muted-foreground shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{entry.title}</h3>
                <span className="text-xs text-muted-foreground">{entry.type}</span>
              </div>
              <span className="text-xs bg-accent px-2 py-1 rounded">{entry.type}</span>
              <button className="p-2 hover:bg-accent rounded-md transition-colors">
                <Copy size={14} />
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
    </>
  )
}
