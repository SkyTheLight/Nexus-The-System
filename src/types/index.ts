export interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  deadline?: string
  tags?: string[]
  status: 'todo' | 'in-progress' | 'done'
  created_at: string
  updated_at: string
}

export interface Idea {
  id: string
  name: string
  description?: string
  category: 'web' | 'mobile' | 'saas' | 'other'
  status: 'idea' | 'planning' | 'building' | 'paused' | 'done'
  potential_score: number
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  title: string
  description?: string
  type: 'short' | 'long'
  progress: number
  created_at: string
  updated_at: string
}

export interface Certificate {
  id: string
  title: string
  provider: string
  deadline?: string
  status: 'not started' | 'studying' | 'scheduled' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  category?: string
  created_at: string
  updated_at: string
}

export interface Music {
  id: string
  title: string
  link: string
  vibe: 'hype' | 'chill' | 'cinematic' | 'other'
  created_at: string
  updated_at: string
}

export interface DevEntry {
  id: string
  title: string
  content: string
  type: 'snippet' | 'prompt' | 'note'
  created_at: string
  updated_at: string
}

export interface PerformanceEntry {
  id: string
  title: string
  game?: string
  sensitivity?: string
  notes?: string
  created_at: string
  updated_at: string
}
