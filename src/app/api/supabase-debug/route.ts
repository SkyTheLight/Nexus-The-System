import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const results: any = {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!anonKey,
    hasServiceKey: !!serviceKey,
    urlLength: supabaseUrl?.length || 0,
    anonKeyLength: anonKey?.length || 0,
    serviceKeyLength: serviceKey?.length || 0,
    anonKeyPreview: anonKey ? anonKey.substring(0, 20) + '...' : 'NOT SET',
    serviceKeyPreview: serviceKey ? serviceKey.substring(0, 20) + '...' : 'NOT SET',
  }

  // Test with anon key
  if (supabaseUrl && anonKey) {
    try {
      const client = createClient(supabaseUrl, anonKey)
      const { data, error } = await client
        .from('tasks')
        .select('count')
        .limit(1)
      
      results.anonTest = {
        success: !error,
        error: error?.message,
        data: data ? 'has data' : 'no data',
      }
    } catch (e: any) {
      results.anonTest = { error: e.message }
    }
  }

  // Test with service role key
  if (supabaseUrl && serviceKey) {
    try {
      const client = createClient(supabaseUrl, serviceKey)
      const { data, error } = await client
        .from('tasks')
        .select('count')
        .limit(1)
      
      results.serviceTest = {
        success: !error,
        error: error?.message,
        data: data ? 'has data' : 'no data',
      }
    } catch (e: any) {
      results.serviceTest = { error: e.message }
    }
  }

  return NextResponse.json(results)
}
