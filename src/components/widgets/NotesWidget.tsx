'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { getNotes, createNote, deleteNote, getSB } from '@/lib/api'
import type { Note } from '@/types'
import { Modal, modalInputClass, modalLabelClass, cancelButtonClass, submitButtonClass } from '@/components/ui/modal'
import DescriptionModal from '@/components/DescriptionModal'

export default function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedItem, setSelectedItem] = useState<Note | null>(null)

  useEffect(() => { 
    loadNotes() 
    
    // Poll every 3 seconds to catch AI-created items
    const interval = setInterval(() => {
      loadNotes()
    }, 3000)
    
    return () => { clearInterval(interval) }
  }, [])

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotes(data.slice(0, 5))
    } catch { } finally { setLoading(false) }
  }

  async function removeNote(id: string) {
    try {
      await deleteNote(id)
      loadNotes()
    } catch { }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    createNote({ title: newTitle, content: '' }).then(() => {
      loadNotes()
      setNewTitle('')
      setIsCreateModalOpen(false)
    })
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Notes</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 hover:bg-accent rounded"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {notes.map(note => (
            <div key={note.id} className="p-2 hover:bg-accent rounded group flex items-center justify-between cursor-pointer" onClick={() => setSelectedItem(note)}>
              <span className="text-xs flex-1">{note.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeNote(note.id) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Note">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className={modalLabelClass}>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title..."
              className={modalInputClass}
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className={cancelButtonClass}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className={submitButtonClass}
            >
              Create Note
            </button>
          </div>
        </form>
      </Modal>
      <DescriptionModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
        description={selectedItem?.content || ''}
        type={selectedItem?.category || ''}
      />
    </>
  )
}
