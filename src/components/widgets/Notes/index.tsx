'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2, Search, Tag } from 'lucide-react'
import { getNotes, createNote, deleteNote, updateNote, getSB } from '@/lib/api'
import type { Note } from '@/types'
import { Modal, modalInputClass, modalLabelClass, cancelButtonClass, submitButtonClass } from '@/components/ui/modal'

const categories = ['Personal', 'Work', 'Ideas', 'Study', 'Projects']

export default function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('Personal')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadNotes()

    const interval = setInterval(() => {
      loadNotes()
    }, 3000)

    return () => { clearInterval(interval) }
  }, [])

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotes(data)
    } catch { } finally { setLoading(false) }
  }

  async function removeNote(id: string) {
    try {
      await deleteNote(id)
      loadNotes()
    } catch { }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      await createNote({ title: newTitle, content: newContent, category: newCategory })
      loadNotes()
      setNewTitle('')
      setNewContent('')
      setNewCategory('Personal')
      setIsCreateModalOpen(false)
    } catch { }
  }

  async function handleUpdateNote(note: Note) {
    try {
      await updateNote(note.id, { content: note.content, category: note.category })
      loadNotes()
      setSelectedNote(null)
    } catch { }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
    return matchesSearch && matchesCategory
  }).slice(0, 10)

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

        <div className="mb-2 space-y-1">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-xs bg-gray-800/50 border border-gray-700 rounded"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-gray-800/50 border border-gray-700 rounded"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="p-2 hover:bg-accent rounded group cursor-pointer"
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs flex-1 truncate">{note.title}</span>
                <div className="flex items-center gap-1">
                  {note.category && (
                    <span className="text-[10px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                      {note.category}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeNote(note.id) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Note">
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-1.5">
            <label className={modalLabelClass}>Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={modalInputClass}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={modalLabelClass}>Content</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your note here... (supports basic formatting)"
              className={modalInputClass}
              rows={6}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className={cancelButtonClass}>
              Cancel
            </button>
            <button type="submit" className={submitButtonClass}>
              Create Note
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selectedNote} onClose={() => setSelectedNote(null)} title={selectedNote?.title || 'Note'}>
        {selectedNote && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={modalLabelClass}>Category</label>
              <select
                value={selectedNote.category || 'Personal'}
                onChange={(e) => setSelectedNote({ ...selectedNote, category: e.target.value })}
                className={modalInputClass}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={modalLabelClass}>Content</label>
              <textarea
                value={selectedNote.content || ''}
                onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                className={modalInputClass}
                rows={10}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className={cancelButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateNote(selectedNote)}
                className={submitButtonClass}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
