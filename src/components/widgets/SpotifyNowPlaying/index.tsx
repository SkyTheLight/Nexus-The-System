'use client'

import { useState, useEffect } from 'react'
import { Music, LogIn } from 'lucide-react'

const STORAGE_KEY = 'adversity-spotify-refresh'

export default function SpotifyNowPlayingWidget() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [loginUrl, setLoginUrl] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('spotify_token')
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
      window.history.replaceState({}, '', window.location.pathname)
      setRefreshToken(token)
      return
    }
    const error = params.get('spotify_error')
    if (error) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) { setRefreshToken(stored); return }
    // Fetch login URL from server
    fetch('/api/spotify/login').then(r => r.json()).then(d => {
      if (d.url) setLoginUrl(d.url)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!refreshToken) { setLoading(false); return }
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch(`/api/spotify?refreshToken=${encodeURIComponent(refreshToken)}`)
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
  }, [refreshToken])

  if (!refreshToken) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-4">
        <Music className="w-8 h-8 text-green-500" />
        <div>
          <p className="text-sm font-medium">Spotify Integration</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Connect your Spotify to show currently playing
          </p>
          {loginUrl ? (
            <a
              href={loginUrl}
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/40 text-xs text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <LogIn size={12} /> Login with Spotify
            </a>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] mt-3">
              Add <code className="text-[#00d4ff]">SPOTIFY_CLIENT_ID</code> to Vercel env, then reload.
            </p>
          )}
        </div>
      </div>
    )
  }

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
        <p className="text-xs text-[var(--color-text-muted)]">Configure Spotify in Vercel env</p>
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
