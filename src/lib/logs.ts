function getSB() {
  const { getSupabase } = require('./supabase')
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  return sb
}

export interface LogItem {
  id?: string
  original_id: string
  type: 'task' | 'idea' | 'goal' | 'certificate' | 'note' | 'music' | 'dev' | 'performance' | 'assignment'
  title?: string
  description?: string
  data: any
  deleted_at?: string
}

export async function getLogs(): Promise<LogItem[]> {
  const sb = getSB()
  if (!sb) throw new Error('Supabase not configured')
  const { data, error } = await sb.from('logs').select('*').order('deleted_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addLog(item: Omit<LogItem, 'id' | 'deleted_at'>) {
  const sb = getSB()
  if (!sb) throw new Error('Supabase not configured')
  
  // Map to actual table columns
  const { data, error } = await sb.from('logs').insert({
    original_id: item.original_id,
    type: item.type,
    title: item.title || null,
    description: item.description || null,
    data: item.data || null,
  }).select().single()
  
  if (error) {
    console.error('Failed to add log:', error)
    throw error
  }
  return data
}

export async function restoreFromLog(logId: string, originalData: any, type: string) {
  const sb = getSB()
  if (!sb) throw new Error('Supabase not configured')
  
  // Re-insert into original table
  const tableMap: Record<string, string> = {
    task: 'tasks',
    goal: 'goals',
    idea: 'ideas',
    certificate: 'certificates',
    note: 'notes',
    music: 'music',
    dev: 'dev_entries',
    performance: 'performance_entries',
  }
  
  const table = tableMap[type]
  if (!table) throw new Error(`Unknown type: ${type}`)
  
  const { error } = await sb.from(table).insert(originalData)
  if (error) throw error
  
  // Remove from logs
  await sb.from('logs').delete().eq('id', logId)
}

export async function clearLogs() {
  const sb = getSB()
  if (!sb) throw new Error('Supabase not configured')
  const { error } = await sb.from('logs').delete().neq('id', '')
  if (error) throw error
}
