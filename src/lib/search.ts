import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Task, Idea, Goal, Certificate, Note, Music, DevEntry, PerformanceEntry } from '@/types'

export type SearchableItem =
  | { type: 'task'; data: Task }
  | { type: 'idea'; data: Idea }
  | { type: 'goal'; data: Goal }
  | { type: 'certificate'; data: Certificate }
  | { type: 'note'; data: Note }
  | { type: 'music'; data: Music }
  | { type: 'dev'; data: DevEntry }
  | { type: 'performance'; data: PerformanceEntry }

const fuseOptions: IFuseOptions<SearchableItem> = {
  keys: [
    { name: 'data.title', weight: 0.4 },
    { name: 'data.name', weight: 0.4 },
    { name: 'data.description', weight: 0.2 },
    { name: 'data.content', weight: 0.1 },
    { name: 'data.notes', weight: 0.1 },
  ],
  threshold: 0.3,
  includeMatches: true,
  includeScore: true,
}

export function searchItems(items: SearchableItem[], query: string): SearchableItem[] {
  if (!query.trim()) return items

  const fuse = new Fuse(items, fuseOptions)
  const results = fuse.search(query)
  return results.map((r) => r.item)
}

export function buildSearchIndex(
  tasks: Task[],
  ideas: Idea[],
  goals: Goal[],
  certificates: Certificate[],
  notes: Note[],
  music: Music[],
  devEntries: DevEntry[],
  performanceEntries: PerformanceEntry[]
): SearchableItem[] {
  return [
    ...tasks.map((t) => ({ type: 'task' as const, data: t })),
    ...ideas.map((i) => ({ type: 'idea' as const, data: i })),
    ...goals.map((g) => ({ type: 'goal' as const, data: g })),
    ...certificates.map((c) => ({ type: 'certificate' as const, data: c })),
    ...notes.map((n) => ({ type: 'note' as const, data: n })),
    ...music.map((m) => ({ type: 'music' as const, data: m })),
    ...devEntries.map((d) => ({ type: 'dev' as const, data: d })),
    ...performanceEntries.map((p) => ({ type: 'performance' as const, data: p })),
  ]
}

export function getSectionLabel(type: SearchableItem['type']): string {
  const labels: Record<SearchableItem['type'], string> = {
    task: 'Tasks',
    idea: 'Ideas',
    goal: 'Goals',
    certificate: 'Certificates',
    note: 'Notes',
    music: 'Music',
    dev: 'Dev Entries',
    performance: 'Performance',
  }
  return labels[type]
}
