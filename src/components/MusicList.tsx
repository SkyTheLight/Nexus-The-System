'use client'

import { useState, useEffect } from 'react'
import { Music, Plus, ExternalLink } from 'lucide-react'
import { Music as MusicType } from '@/types'
import { getMusic, createMusicTrack } from '@/lib/api'
import { CreateMusicModal } from '@/components/Modal'

export default function MusicList() {
  const [tracks, setTracks] = useState<MusicType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    loadTracks()
  }, [])

  async function loadTracks() {
    try {
      const data = await getMusic()
      setTracks(data)
    } catch (error) {
      console.error('Error loading music:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(track: Omit<MusicType, 'id' | 'created_at' | 'updated_at'>) {
    try {
      await createMusicTrack(track)
      loadTracks()
    } catch (error) {
      console.error('Error creating track:', error)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Music</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Add Track
          </button>
        </div>

        <div className="space-y-2">
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-accent-foreground/20 transition-colors">
              <Music size={18} className="text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-medium">{track.title}</span>
              <span className="text-xs bg-accent px-2 py-1 rounded">{track.vibe}</span>
              <a
                href={track.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
      <CreateMusicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
