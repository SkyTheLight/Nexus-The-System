'use client'

import { useState, useEffect } from 'react'
import { Music } from 'lucide-react'

export default function SpotifyNowPlayingWidget() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch('/api/spotify')
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Spotify fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (data?.setup) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-4">
        <Music className="w-8 h-8 text-green-500" />
        <div>
          <p className="text-sm font-medium">Spotify Integration</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add Spotify credentials to .env.local
          </p>
        </div>
      </div>
    )
  }

  if (!data?.playing) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-4">
        <Music className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Not playing anything</p>
      </div>
    )
  }

  const { item } = data

  return (
    <div className="h-full flex gap-3">
      {item.image && (
        <img 
          src={item.image} 
          alt={item.album}
          className="w-16 h-16 rounded-lg object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <a 
          href={item.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline truncate block"
        >
          {item.name}
        </a>
        <p className="text-xs text-muted-foreground truncate">
          {item.artists.join(', ')}
        </p>
        <p className="text-xs text-muted-foreground/70 truncate">
          {item.album}
        </p>
        {item.is_playing && (
          <div className="flex items-center gap-1 mt-2">
            <div className="w-1 h-3 bg-green-500 animate-bounce" />
            <div className="w-1 h-4 bg-green-500 animate-bounce delay-100" />
            <div className="w-1 h-2 bg-green-500 animate-bounce delay-200" />
          </div>
        )}
      </div>
    </div>
  )
}
