import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cihmiaytrnvvvbxwoxrb.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  console.log('[supabase-debug] URL:', url)
  console.log('[supabase-debug] Key length:', key.length)
  console.log('[supabase-debug] Key prefix:', key.substring(0, 10))
  
  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase.from('tasks').select('*').limit(1)
    
    if (error) {
      return NextResponse.json({ error: error.message, url, keyPrefix: key.substring(0, 10) })
    }
    
    return NextResponse.json({ success: true, data, url, keyPrefix: key.substring(0, 10) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, url, keyPrefix: key.substring(0, 10) })
  }
}
