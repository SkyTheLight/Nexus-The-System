import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'SPOTIFY_CLIENT_ID not configured' }, { status: 400 })
  }

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/spotify-callback`
  const scopes = 'user-read-currently-playing,user-read-playback-state'

  const url = new URL('https://accounts.spotify.com/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scopes)
  url.searchParams.set('show_dialog', 'true')

  return NextResponse.json({ url: url.toString() })
}
