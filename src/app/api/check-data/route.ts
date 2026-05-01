import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'

const tables = [
  'tasks',
  'goals', 
  'ideas',
  'music',
  'notes',
  'certificates',
  'dev_entries',
  'performance_entries',
  'assignments',
  'logs'
]

export async function GET() {
  try {
    const supabase = getSupabase()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const results: Record<string, any> = {}
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results[table] = { error: error.message }
        } else {
          // Get sample data (first 3 rows)
          const { data: sample } = await supabase
            .from(table)
            .select('*')
            .limit(3)
          
          results[table] = { 
            count: count || 0,
            sample: sample || []
          }
        }
      } catch (e: any) {
        results[table] = { error: e.message }
      }
    }
    
    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
