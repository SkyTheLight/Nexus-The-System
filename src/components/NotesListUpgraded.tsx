'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotes, createNote, deleteNote } from '@/lib/api'
import { Note } from '@/types'
import { queryKeys } from '@/lib/queryKeys'
import { Plus, Search, Trash2, Pencil, FileText } from 'lucide-react'
import NotesEditor from './NotesEditor'

export default function NotesListUpgraded() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const { data: notes = [], isLoading } = useQuery({
    queryKey: queryKeys.notes(),
    queryFn: getNotes,
  })

  const createMutation = useMutation({
    mutationFn: () => createNote({ title: 'Untitled', content: '' }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.notes(), (old: Note[] = []) => [data, ...old])
      setSelectedNoteId(data.id)
      setShowEditor(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      if (selectedNoteId && deleteMutation.variables === selectedNoteId) {
        setSelectedNoteId(null)
        setShowEditor(false)
      }
    },
  })

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id)
    setShowEditor(true)
  }

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false)
    setSelectedNoteId(null)
  }, [])

  const handleFloatingAdd = () => {
    createMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex gap-6">
      {/* Notes List Sidebar */}
      {/* Notes List Sidebar */}
      <div className={`${showEditor ? 'hidden md:block' : ''} w-full md:w-80 flex-shrink-0 flex flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Notes</h1>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {search ? 'No notes found' : 'No notes yet. Create one to start.'}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {filtered.map(note => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-150 hover:bg-surface ${
                  selectedNoteId === note.id ? 'bg-surface border border-primary/30 shadow-glow' : 'border border-transparent hover:border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm truncate flex-1">{note.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete this note?')) {
                        deleteMutation.mutate(note.id)
                      }
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {note.content && (
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                    {note.content.replace(/[#*_~`>]/g, '').slice(0, 100)}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {note.category && (
                    <span className="text-xs bg-accent px-2 py-0.5 rounded">{note.category}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      {showEditor && (
        <div className="flex-1 min-w-0">
          <NotesEditor noteId={selectedNoteId} onClose={handleCloseEditor} />
        </div>
      )}

    </div>
  )
}
