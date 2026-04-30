import type { Task, Idea, Goal, Certificate, Note, Music, DevEntry, PerformanceEntry } from '@/types'

export function getSB() {
  const { getSupabase } = require('./supabase')
  const sb = getSupabase()
  if (!sb) throw new Error('Supabase not configured')
  return sb
}

// Tasks - Use API endpoint to bypass RLS
export async function getTasks(): Promise<Task[]> {
  try {
    console.log('getTasks: Fetching from API...')
    const res = await fetch('/api/widget?type=tasks')
    if (!res.ok) {
      console.error('getTasks: API error:', res.status)
      return []
    }
    const data = await res.json()
    console.log('getTasks: Returned', data?.length || 0, 'tasks')
    return data || []
  } catch (e) {
    console.error('getTasks: Fetch error:', e)
    return []
  }
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const sb = getSB()
  const { data, error } = await sb.from('tasks').insert(task).select().single()
  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const sb = getSB()
  const { data, error } = await sb.from('tasks').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const sb = getSB()
  // Get the item before deleting
  const { data: item } = await sb.from('tasks').select('*').eq('id', id).single()
  const { error } = await sb.from('tasks').delete().eq('id', id)
  if (error) throw error
  // Log the deleted item
  if (item) {
    await sb.from('logs').insert({
      original_id: id,
      type: 'task',
      title: item.title,
      description: item.description,
      data: item,
    })
  }
}

// Ideas - Use API endpoint to bypass RLS
export async function getIdeas(): Promise<Idea[]> {
  try {
    const res = await fetch('/api/widget?type=ideas')
    if (!res.ok) return []
    return await res.json() || []
  } catch (e) {
    console.error('getIdeas: Fetch error:', e)
    return []
  }
}

export async function createIdea(idea: Omit<Idea, 'id' | 'created_at' | 'updated_at'>): Promise<Idea> {
  const sb = getSB()
  const { data, error } = await sb.from('ideas').insert(idea).select().single()
  if (error) throw error
  return data
}

export async function updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
  const sb = getSB()
  const { data, error } = await sb.from('ideas').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteIdea(id: string): Promise<void> {
  const sb = getSB()
  // Get the item before deleting
  const { data: item } = await sb.from('ideas').select('*').eq('id', id).single()
  const { error } = await sb.from('ideas').delete().eq('id', id)
  if (error) throw error
  // Log the deleted item
  if (item) {
    await sb.from('logs').insert({
      original_id: id,
      type: 'idea',
      title: item.name,
      description: item.description,
      data: item,
    })
  }
}

// Goals - Use API endpoint to bypass RLS
export async function getGoals(): Promise<Goal[]> {
  try {
    const res = await fetch('/api/widget?type=goals')
    if (!res.ok) return []
    return await res.json() || []
  } catch (e) {
    console.error('getGoals: Fetch error:', e)
    return []
  }
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
  const sb = getSB()
  const { data, error } = await sb.from('goals').insert(goal).select().single()
  if (error) throw error
  return data
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
  const sb = getSB()
  const { data, error } = await sb.from('goals').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteGoal(id: string): Promise<void> {
  const sb = getSB()
  // Get the item before deleting
  const { data: item } = await sb.from('goals').select('*').eq('id', id).single()
  const { error } = await sb.from('goals').delete().eq('id', id)
  if (error) throw error
  // Log the deleted item
  if (item) {
    await sb.from('logs').insert({
      original_id: id,
      type: 'goal',
      title: item.title,
      description: item.description,
      data: item,
    })
  }
}

// Certificates - Use API endpoint to bypass RLS
export async function getCertificates(): Promise<Certificate[]> {
  try {
    const res = await fetch('/api/widget?type=certificates')
    if (!res.ok) return []
    return await res.json() || []
  } catch (e) {
    console.error('getCertificates: Fetch error:', e)
    return []
  }
}

export async function createCertificate(cert: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>): Promise<Certificate> {
  const sb = getSB()
  const { data, error } = await sb.from('certificates').insert(cert).select().single()
  if (error) throw error
  return data
}

export async function updateCertificate(id: string, updates: Partial<Certificate>): Promise<Certificate> {
  const sb = getSB()
  const { data, error } = await sb.from('certificates').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCertificate(id: string): Promise<void> {
  const sb = getSB()
  // Get the item before deleting
  const { data: item } = await sb.from('certificates').select('*').eq('id', id).single()
  const { error } = await sb.from('certificates').delete().eq('id', id)
  if (error) throw error
  // Log the deleted item
  if (item) {
    await sb.from('logs').insert({
      original_id: id,
      type: 'certificate',
      title: item.title,
      description: item.provider,
      data: item,
    })
  }
}

// Notes - Use API endpoint to bypass RLS
export async function getNotes(): Promise<Note[]> {
  try {
    const res = await fetch('/api/widget?type=notes')
    if (!res.ok) return []
    return await res.json() || []
  } catch (e) {
    console.error('getNotes: Fetch error:', e)
    return []
  }
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  const sb = getSB()
  const { data, error } = await sb.from('notes').insert(note).select().single()
  if (error) throw error
  return data
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const sb = getSB()
  const { data, error } = await sb.from('notes').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteNote(id: string): Promise<void> {
  const sb = getSB()
  // Get the item before deleting
  const { data: item } = await sb.from('notes').select('*').eq('id', id).single()
  const { error } = await sb.from('notes').delete().eq('id', id)
  if (error) throw error
  // Log the deleted item
  if (item) {
    await sb.from('logs').insert({
      original_id: id,
      type: 'note',
      title: item.title,
      description: item.content,
      data: item,
    })
  }
}

// Music - Use API endpoint to bypass RLS
export async function getMusic(): Promise<Music[]> {
  try {
    const res = await fetch('/api/widget?type=music')
    if (!res.ok) return []
    return await res.json() || []
  } catch (e) {
    console.error('getMusic: Fetch error:', e)
    return []
  }
}

export async function createMusicTrack(track: Omit<Music, 'id' | 'created_at' | 'updated_at'>): Promise<Music> {
  const sb = getSB()
  const { data, error } = await sb.from('music').insert(track).select().single()
  if (error) throw error
  return data
}

export async function deleteMusic(id: string): Promise<void> {
  const sb = getSB()
  // Get the item before deleting
  const { data: item } = await sb.from('music').select('*').eq('id', id).single()
  const { error } = await sb.from('music').delete().eq('id', id)
  if (error) throw error
  // Log the deleted item
  if (item) {
    await sb.from('logs').insert({
      original_id: id,
      type: 'music',
      title: item.title,
      description: item.link,
      data: item,
    })
  }
}

// Dev Entries - Use API endpoint to bypass RLS
export async function getDevEntries(): Promise<DevEntry[]> {
  try {
    const res = await fetch('/api/widget?type=dev')
    if (!res.ok) return []
    return await res.json() || []
  } catch (e) {
    console.error('getDevEntries: Fetch error:', e)
    return []
  }
}

export async function createDevEntry(entry: Omit<DevEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DevEntry> {
  const sb = getSB()
  const { data, error } = await sb.from('dev_entries').insert(entry).select().single()
  if (error) throw error
  return data
}

export async function deleteDevEntry(id: string): Promise<void> {
  const sb = getSB()
  // Get the item before deleting
  const { data: item } = await sb.from('dev_entries').select('*').eq('id', id).single()
  const { error } = await sb.from('dev_entries').delete().eq('id', id)
  if (error) throw error
  // Log the deleted item
  if (item) {
    await sb.from('logs').insert({
      original_id: id,
      type: 'dev',
      title: item.title,
      description: item.content,
      data: item,
    })
  }
}

// Performance Entries - Use API endpoint to bypass RLS
export async function getPerformanceEntries(): Promise<PerformanceEntry[]> {
  try {
    const res = await fetch('/api/widget?type=performance')
    if (!res.ok) return []
    return await res.json() || []
  } catch (e) {
    console.error('getPerformanceEntries: Fetch error:', e)
    return []
  }
}

export async function createPerformanceEntry(entry: Omit<PerformanceEntry, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceEntry> {
  const sb = getSB()
  const { data, error } = await sb.from('performance_entries').insert(entry).select().single()
  if (error) throw error
  return data
}

export async function deletePerformanceEntry(id: string): Promise<void> {
  const sb = getSB()
  if (!sb) throw new Error('Supabase not configured')
  // Get the item before deleting
  const { data: item } = await sb.from('performance_entries').select('*').eq('id', id).single()
  const { error } = await sb.from('performance_entries').delete().eq('id', id)
  if (error) throw error
  // Log the deleted item
  if (item) {
    await sb.from('logs').insert({
      original_id: id,
      type: 'performance',
      title: item.title,
      description: item.notes,
      data: item,
    })
  }
}

// Dashboard Layout
export interface DashboardWidget {
  id?: string
  widget_id: string
  x: number
  y: number
  w: number
  h: number
  visible: boolean
}

export async function getDashboardLayout(): Promise<DashboardWidget[]> {
  const sb = getSB()
  if (!sb) throw new Error('Supabase not configured')
  const { data, error } = await sb.from('dashboard_layout').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function saveDashboardLayout(widgets: DashboardWidget[]): Promise<void> {
  const sb = getSB()
  if (!sb) throw new Error('Supabase not configured')
  
  // Map to only include fields that exist in the table
  const mappedWidgets = widgets.map(w => ({
    widget_id: w.widget_id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    visible: w.visible,
  }))
  
  // Upsert all widgets
  const { error } = await sb.from('dashboard_layout')
    .upsert(mappedWidgets, { onConflict: 'widget_id' })
  
  if (error) {
    console.error('Supabase upsert error:', error)
    throw error
  }
}

// Assignments - Use API endpoint to bypass RLS
export async function getAssignments(): Promise<any[]> {
  try {
    const res = await fetch('/api/widget?type=assignments')
    if (!res.ok) return []
    return await res.json() || []
  } catch (e) {
    console.error('getAssignments: Fetch error:', e)
    return []
  }
}

export async function createAssignment(assignment: { title: string; description: string; deadline: string }) {
  const sb = getSB()
  const { data, error } = await sb.from('assignments').insert(assignment).select().single()
  if (error) throw error
  return data
}

export async function updateAssignment(id: string, updates: any) {
  const sb = getSB()
  const { data, error } = await sb.from('assignments').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAssignment(id: string) {
  const sb = getSB()
  const { error } = await sb.from('assignments').delete().eq('id', id)
  if (error) throw error
}
