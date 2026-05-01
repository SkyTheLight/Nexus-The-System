import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const client = getSupabase()
    if (!client) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 })
    }
    
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      count: data?.length || 0,
      message: 'Supabase connection successful'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
