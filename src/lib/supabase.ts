import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cihmiaytrnvvvbxwoxrb.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  
  console.log('[getSupabase] URL:', supabaseUrl ? 'set' : 'missing', 'KEY:', supabaseAnonKey ? 'set' : 'missing')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('getSupabase: Missing URL or anon key')
    return null
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// For server-side use with service role (bypasses RLS)
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('getSupabaseAdmin: Missing URL or service role key')
    return null
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
