'use client'

import { useState, useEffect } from 'react'
import { Music as MusicIcon, Plus, ExternalLink, Trash2 } from 'lucide-react'
import { getMusic, createMusicTrack, deleteMusic, getSB } from '@/lib/api'
import { addLog } from '@/lib/logs'
import type { Music } from '@/types'
import { CreateMusicModal } from '@/components/Modal'
import DescriptionModal from '@/components/DescriptionModal'

export default function MusicWidget() {
  const [tracks, setTracks] = useState<Music[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Music | null>(null)

  useEffect(() => { 
    loadTracks() 
    
    // Poll every 3 seconds to catch AI-created items
    const interval = setInterval(() => {
      loadTracks()
    }, 3000)
    
    return () => { clearInterval(interval) }
  }, [])

  async function loadTracks() {
    try {
      const data = await getMusic()
      setTracks(data.slice(0, 5))
    } catch { } finally { setLoading(false) }
  }

  async function removeTrack(id: string) {
    try {
      const track = tracks.find(t => t.id === id)
      if (track) {
        await addLog({ original_id: id, type: 'music', title: track.title, description: track.link, data: track })
      }
      await deleteMusic(id)
      loadTracks()
    } catch { }
  }

  async function handleCreate(track: Omit<Music, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createMusicTrack(track)
      loadTracks()
    } catch { }
  }

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Music</h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 hover:bg-accent rounded"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {tracks.map(track => (
            <div key={track.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded group">
              <MusicIcon size={12} className="text-muted-foreground shrink-0" />
              <div className="flex-1 cursor-pointer" onClick={() => setSelectedItem(track)}>
                <span className="text-xs">{track.title}</span>
                {track.vibe && <span className="text-xs text-muted-foreground ml-2">{track.vibe}</span>}
              </div>
              <a
                href={track.link}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={12} />
              </a>
              <button
                onClick={() => removeTrack(track.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <CreateMusicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
      <DescriptionModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || ''}
        description={selectedItem?.link || ''}
        type={selectedItem?.vibe || ''}
        extra={selectedItem ? [
          { label: 'Vibe', value: selectedItem.vibe },
          { label: 'Link', value: selectedItem.link },
        ] : []}
      />
    </>
  )
}
