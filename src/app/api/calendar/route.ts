import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string | null
  location: string | null
  isAllDay: boolean
}

// Refresh Google token
async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.access_token || null
  } catch {
    return null
  }
}

// Get valid access token
async function getValidToken(supabase: any, userEmail: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('email', userEmail)
    .single()

  if (error || !data) return null

  // Check if token is expired
  if (data.google_token_expiry && new Date(data.google_token_expiry) > new Date()) {
    return data.google_access_token
  }

  // Token expired, refresh
  if (data.google_refresh_token) {
    const newToken = await refreshGoogleToken(data.google_refresh_token)
    if (newToken) {
      // Save new token
      await supabase
        .from('users')
        .update({
          google_access_token: newToken,
          google_token_expiry: new Date(Date.now() + 3600 * 1000).toISOString()
        })
        .eq('email', userEmail)
      return newToken
    }
  }

  return data.google_access_token
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    // Get user from session (simplified—in production, use getSession)
    // For now, return empty if no token found
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .limit(1)
      .single()

    if (!userData?.email) {
      return NextResponse.json({ events: [], authenticated: false })
    }

    const accessToken = await getValidToken(supabase, userData.email)
    if (!accessToken) {
      return NextResponse.json({ events: [], authenticated: false })
    }

    const timeMin = new Date().toISOString()
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
    url.searchParams.set('maxResults', '5')
    url.searchParams.set('orderBy', 'startTime')
    url.searchParams.set('singleEvents', 'true')
    url.searchParams.set('timeMin', timeMin)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!res.ok) {
      return NextResponse.json({ events: [], authenticated: false })
    }

    const data = await res.json()
    const events: CalendarEvent[] = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.summary || 'Untitled',
      start: item.start?.dateTime || item.start?.date || '',
      end: item.end?.dateTime || item.end?.date || null,
      location: item.location || null,
      isAllDay: !!item.start?.date
    }))

    return NextResponse.json({ events, authenticated: true })
  } catch (error: any) {
    console.error('Calendar API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
