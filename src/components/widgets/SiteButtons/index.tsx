'use client'

import { useState } from 'react'
import { useSites, type SiteEntry } from './useSites'
import SiteButton from './SiteButton'
import { Plus, X } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SiteCategory } from '@/lib/sites'

function SortableSite({ site }: { site: SiteEntry }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: site.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SiteButton site={site} />
    </div>
  )
}

const CATEGORIES: { key: SiteCategory; label: string }[] = [
  { key: 'ai', label: 'AI Tools' },
  { key: 'school', label: 'School' },
  { key: 'social', label: 'Social' },
  { key: 'dev', label: 'Dev' },
  { key: 'all', label: 'All' }
]

export default function SiteButtonsWidget() {
  const { sites, loading, saveOrder, addSite } = useSites()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [activeCategory, setActiveCategory] = useState<SiteCategory>('all')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sites.findIndex(s => s.id === active.id)
    const newIndex = sites.findIndex(s => s.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newSites = arrayMove(sites, oldIndex, newIndex)
    saveOrder(newSites)
  }

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return
    addSite(newName.trim(), newUrl.trim(), activeCategory)
    setNewName('')
    setNewUrl('')
    setShowForm(false)
  }

  const getPreviewFavicon = () => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(newUrl).hostname}&sz=64` } catch { return '' }
  }

  const filteredSites = activeCategory === 'all'
    ? sites
    : sites.filter(s => s.category === activeCategory)

  if (loading) return <div className="text-muted-foreground text-sm p-4">LOADING...</div>

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">SITE BUTTONS</h3>
        <button onClick={() => setShowForm(!showForm)} className="p-1 hover:bg-white/5 rounded transition-colors">
          {showForm ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`text-[10px] px-2 py-1 rounded-full border transition-all ${
              activeCategory === cat.key
                ? 'border-[#00d4ff] text-[#00d4ff]'
                : 'border-[#ffffff22] text-[#ffffff44] hover:border-[#ffffff44]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-3 p-3 bg-[#0B0B0C] border border-[#00d4ff22] rounded-lg space-y-2">
          <select
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value as SiteCategory)}
            className="w-full px-2 py-1 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
          >
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Site name"
            className="w-full px-2 py-1 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
          />
          <input
            type="text"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-2 py-1 text-xs bg-black border border-[#00d4ff22] rounded text-white font-mono"
          />
          {newUrl && (
            <div className="flex items-center gap-2">
              <img src={getPreviewFavicon()} alt="preview" className="w-6 h-6" onError={e => (e.currentTarget.style.display = 'none')} />
              <span className="text-[10px] text-[#00d4ff88]">Preview</span>
            </div>
          )}
          <button
            onClick={handleAdd}
            className="w-full py-1 bg-[#00d4ff] text-black text-xs font-bold rounded hover:opacity-90 transition-opacity"
          >
            ADD SITE
          </button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredSites.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 grid grid-cols-3 gap-2 overflow-y-auto">
            {filteredSites.map(site => (
              <SortableSite key={site.id} site={site} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredSites.length === 0 && !showForm && (
        <div className="text-xs text-muted-foreground text-center py-4">No sites added</div>
      )}
    </div>
  )
}
