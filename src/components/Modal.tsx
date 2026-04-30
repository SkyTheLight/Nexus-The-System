import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task, Goal, Idea, Certificate, Music, DevEntry, PerformanceEntry } from '@/types'
import { Modal, modalInputClass, modalTextareaClass, modalLabelClass, cancelButtonClass, submitButtonClass } from '@/components/ui/modal'

type TaskPriority = 'low' | 'medium' | 'high'
type TaskStatus = 'todo' | 'in-progress' | 'done'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
}

export function CreateTaskModal({ isOpen, onClose, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title, priority, description, status: 'todo' })
    setTitle('')
    setDescription('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className={modalInputClass}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={3}
            className={modalTextareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Priority</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-4 py-1.5 rounded-full text-xs capitalize transition-all border ${
                  priority === p
                    ? p === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : p === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className={submitButtonClass}
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => void
}

export function CreateGoalModal({ isOpen, onClose, onCreate }: CreateGoalModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'short' | 'long'>('short')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title, description, type, progress: 0 })
    setTitle('')
    setDescription('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Goal">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title..."
            className={modalInputClass}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={3}
            className={modalTextareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Type</label>
          <div className="flex gap-2">
            {(['short', 'long'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-full text-xs capitalize transition-all border ${
                  type === t
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {t} term
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className={submitButtonClass}
          >
            Create Goal
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface CreateIdeaModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (idea: Omit<Idea, 'id' | 'created_at' | 'updated_at'>) => void
}

export function CreateIdeaModal({ isOpen, onClose, onCreate }: CreateIdeaModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'web' | 'mobile' | 'saas' | 'other'>('web')

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ name, description, category, status: 'idea', potential_score: 0 })
    setName('')
    setDescription('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Idea">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Idea name..."
            className={modalInputClass}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={3}
            className={modalTextareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Category</label>
          <div className="flex gap-2 flex-wrap">
            {(['web', 'mobile', 'saas', 'other'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-xs capitalize transition-all border ${
                  category === c
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className={submitButtonClass}
          >
            Create Idea
          </button>
        </div>
      </form>
    </Modal>
  )
 }

interface CreateCertificateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (cert: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>) => void
}

export function CreateCertificateModal({ isOpen, onClose, onCreate }: CreateCertificateModalProps) {
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title, provider, status: 'not started', notes: '' })
    setTitle('')
    setProvider('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Certificate">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Certificate title..."
            className={modalInputClass}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Provider</label>
          <input
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Provider (e.g. AWS, Google)..."
            className={modalInputClass}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className={submitButtonClass}
          >
            Add Certificate
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface CreateMusicModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (track: Omit<Music, 'id' | 'created_at' | 'updated_at'>) => void
}

export function CreateMusicModal({ isOpen, onClose, onCreate }: CreateMusicModalProps) {
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [vibe, setVibe] = useState<'hype' | 'chill' | 'cinematic' | 'other'>('chill')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title, link, vibe })
    setTitle('')
    setLink('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Music Track">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Track title..."
            className={modalInputClass}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Link</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="YouTube/Spotify link..."
            className={modalInputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Vibe</label>
          <div className="flex gap-2 flex-wrap">
            {(['hype', 'chill', 'cinematic', 'other'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setVibe(v)}
                className={`px-4 py-1.5 rounded-full text-xs capitalize transition-all border ${
                  vibe === v
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className={submitButtonClass}
          >
            Add Track
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface CreateDevEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (entry: Omit<DevEntry, 'id' | 'created_at' | 'updated_at'>) => void
}

export function CreateDevEntryModal({ isOpen, onClose, onCreate }: CreateDevEntryModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'snippet' | 'prompt' | 'note'>('snippet')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title, content, type })
    setTitle('')
    setContent('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Dev Entry">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title..."
            className={modalInputClass}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Code snippet, prompt, or notes..."
            rows={4}
            className={modalTextareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Type</label>
          <div className="flex gap-2">
            {(['snippet', 'prompt', 'note'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-full text-xs capitalize transition-all border ${
                  type === t
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className={submitButtonClass}
          >
            Create Entry
          </button>
        </div>
      </form>
    </Modal>
  )
}

interface CreatePerformanceEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (entry: Omit<PerformanceEntry, 'id' | 'created_at' | 'updated_at'>) => void
}

export function CreatePerformanceEntryModal({ isOpen, onClose, onCreate }: CreatePerformanceEntryModalProps) {
  const [title, setTitle] = useState('')
  const [game, setGame] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title, game, notes })
    setTitle('')
    setGame('')
    setNotes('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Performance Entry">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title..."
            className={modalInputClass}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Game</label>
          <input
            type="text"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="Game name..."
            className={modalInputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={modalLabelClass}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Performance notes..."
            rows={3}
            className={modalTextareaClass}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cancelButtonClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className={submitButtonClass}
          >
            Create Entry
          </button>
        </div>
      </form>
    </Modal>
  )
}
