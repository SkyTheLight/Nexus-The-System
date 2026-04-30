'use client'

import { useState, useEffect } from 'react'
import { Gamepad2, Plus, Monitor } from 'lucide-react'
import { PerformanceEntry } from '@/types'
import { getPerformanceEntries, createPerformanceEntry } from '@/lib/api'
import { CreatePerformanceEntryModal } from '@/components/Modal'

export default function PerformanceMode() {
  const [entries, setEntries] = useState<PerformanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    try {
      const data = await getPerformanceEntries()
      setEntries(data)
    } catch (error) {
      console.error('Error loading performance entries:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(entry: Omit<PerformanceEntry, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createPerformanceEntry(entry)
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
          <h1 className="text-3xl font-bold">Performance Mode</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New Entry
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-card border border-border rounded-lg p-5 hover:border-accent-foreground/20 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Gamepad2 size={16} className="text-muted-foreground" />
                <h3 className="font-semibold text-sm">{entry.title}</h3>
              </div>
              {entry.game && (
                <div className="flex items-center gap-2 mb-2">
                  <Monitor size={12} className="text-muted-foreground" />
                  <span className="text-xs text-gray-300">{entry.game}</span>
                </div>
              )}
              {entry.notes && (
                <p className="text-xs text-gray-300 font-mono bg-accent px-2 py-1 rounded mt-2">
                  {entry.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <CreatePerformanceEntryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
