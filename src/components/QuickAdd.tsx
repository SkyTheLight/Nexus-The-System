'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function QuickAdd() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    console.log('Quick add:', title)
    setTitle('')
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-opacity z-50"
      >
        <Plus size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Quick Add</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-accent rounded">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to add?"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent-foreground/20 mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
