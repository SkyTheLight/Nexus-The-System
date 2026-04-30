'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Search } from 'lucide-react'
import { Note } from '@/types'
import { getNotes, createNote } from '@/lib/api'
import { Modal, modalInputClass, modalLabelClass, cancelButtonClass, submitButtonClass } from '@/components/ui/modal'

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotes(data)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    createNote({ title: newTitle, content: '' }).then(() => {
      loadNotes()
      setNewTitle('')
      setIsCreateModalOpen(false)
    })
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Notes</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <div key={note.id} className="bg-card border border-border rounded-lg p-5 hover:border-accent-foreground/20 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{note.title}</h3>
                {note.category && <span className="text-xs bg-accent px-2 py-0.5 rounded">{note.category}</span>}
              </div>
              <p className="text-xs text-gray-300">Updated {new Date(note.updated_at).toLocaleDateString()}</p>
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
    </>
  )
}
