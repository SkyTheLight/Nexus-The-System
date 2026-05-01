import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

const tableMap: Record<string, string> = {
  'todos': 'tasks',
  'tasks': 'tasks',
  'goals': 'goals',
  'ideas': 'ideas',
  'notes': 'notes',
  'music': 'music',
  'dev': 'dev_entries',
  'dev_mode': 'dev_entries',
  'performance': 'performance_entries',
  'performance_entries': 'performance_entries',
  'certificates': 'certificates',
  'assignments': 'assignments',
}

function getTableName(type: string): string {
  return tableMap[type] || type
}

function getClient() {
  console.log('[API/widget] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING')
  console.log('[API/widget] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'MISSING')
  
  const client = getSupabase()
  if (!client) {
    throw new Error(`Supabase client not initialized - URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'exists' : 'missing'}, ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing'}`)
  }
  return client
}

// GET - Read all data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  
  if (!type) {
    return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 })
  }
  
  const tableName = getTableName(type)

  try {
    const supabase = getClient()
    const { data, error } = await supabase
       .from(tableName)
       .select('*')
       .order('created_at', { ascending: false })
       .limit(20)
    
    if (error) throw error
    console.log(`API /widget GET: Returned ${(data || []).length} items from ${tableName}`)
    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error(`API /widget GET: Error fetching from ${tableName}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new item
export async function POST(request: NextRequest) {
  try {
    const supabase = getClient()
    const { type, item } = await request.json()
    
    if (!type || !item) {
      return NextResponse.json({ error: 'Missing type or item' }, { status: 400 })
    }

    const tableName = getTableName(type)

    const { data, error } = await supabase
      .from(tableName)
      .insert(item)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, message: 'Item created successfully' })
  } catch (error: any) {
    console.error('getTasks: API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update item
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getClient()
    const { type, id, updates } = await request.json()
    
    if (!type || !id || !updates) {
      return NextResponse.json({ error: 'Missing type, id, or updates' }, { status: 400 })
    }

    const tableName = getTableName(type)

    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data, message: 'Item updated successfully' })
  } catch (error: any) {
    console.error('API PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove item
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    
    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
    }

    const tableName = getTableName(type)

    // Log deletion first
    try {
      await supabase
        .from('logs')
        .insert({
          entity_type: tableName,
          entity_id: id.toString(),
          entity_data: { deleted_via: 'ARISE API' },
          action: 'delete'
        })
    } catch (logError) {
      console.error('Failed to log deletion:', logError)
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error: any) {
    console.error('API DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
