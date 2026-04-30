'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotes, updateNote, createNote, deleteNote } from '@/lib/api'
import { Note } from '@/types'
import { queryKeys } from '@/lib/queryKeys'
import { X, Trash2, Save, Eye, Pencil } from 'lucide-react'

interface NotesEditorProps {
  noteId: string | null
  onClose: () => void
}

export default function NotesEditor({ noteId, onClose }: NotesEditorProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: note, isLoading } = useQuery({
    queryKey: noteId ? ['note', noteId] : ['none'],
    queryFn: () => getNotes().then(notes => notes.find(n => n.id === noteId) || null),
    enabled: !!noteId,
  })

  // Sync local state with fetched note
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content || '')
    }
  }, [note])

  // Auto-save with debounce
  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaving(true)
      const result = await updateNote(noteId!, { title: title || 'Untitled', content })
      return result
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.note(data.id), data)
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      setTimeout(() => setSaving(false), 500)
    },
    onError: () => setSaving(false),
  })

  // Debounced save
  const debouncedSave = useCallback(
    debounce(() => saveMutation.mutate(), 500),
    [saveMutation]
  )

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    debouncedSave()
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    debouncedSave()
  }

  const handleDelete = async () => {
    if (!noteId || !confirm('Delete this note?')) return
    try {
      await deleteNote(noteId)
      queryClient.invalidateQueries({ queryKey: queryKeys.notes() })
      onClose()
    } catch (e) {
      alert('Failed to delete note')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={onClose}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2">
          {saving ? (
            <span className="text-xs text-muted-foreground">Saving...</span>
          ) : (
            <span className="text-xs text-success">Saved</span>
          )}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg hover:bg-accent transition-colors"
          >
            {isPreview ? <Pencil size={14} /> : <Eye size={14} />}
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-4">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="w-full bg-transparent text-2xl font-bold border-none outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-y-auto px-6 py-4 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '*Start writing...*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Write in Markdown..."
            className="w-full h-full p-6 bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder:text-muted-foreground/50 font-mono"
          />
        )}
      </div>

      {/* Status bar */}
      <div className="px-6 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{content.length} characters</span>
        <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        {note?.updated_at && (
          <span>Last edited {new Date(note.updated_at).toLocaleString()}</span>
        )}
      </div>
    </div>
  )
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }) as T
}
