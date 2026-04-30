'use client'

import { useState, useEffect } from 'react'
import { SearchPalette } from '@/components/SearchPalette'
import { useQuery } from '@tanstack/react-query'
import { getTasks, getIdeas, getGoals, getCertificates, getNotes, getMusic, getDevEntries, getPerformanceEntries } from '@/lib/api'
import type { SearchableItem } from '@/lib/search'

export function SearchWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: getTasks })
  const { data: ideas = [] } = useQuery({ queryKey: ['ideas'], queryFn: getIdeas })
  const { data: goals = [] } = useQuery({ queryKey: ['goals'], queryFn: getGoals })
  const { data: certificates = [] } = useQuery({ queryKey: ['certificates'], queryFn: getCertificates })
  const { data: notes = [] } = useQuery({ queryKey: ['notes'], queryFn: getNotes })
  const { data: music = [] } = useQuery({ queryKey: ['music'], queryFn: getMusic })
  const { data: devEntries = [] } = useQuery({ queryKey: ['devEntries'], queryFn: getDevEntries })
  const { data: performanceEntries = [] } = useQuery({ queryKey: ['performanceEntries'], queryFn: getPerformanceEntries })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (item: SearchableItem) => {
    setIsOpen(false)
    // Navigate based on item type
    const routes: Record<string, string> = {
      task: '/todos',
      idea: '/ideas',
      goal: '/goals',
      certificate: '/certificates',
      note: '/notes',
      music: '/music',
      dev: '/dev',
      performance: '/performance',
    }
    const route = routes[item.type]
    if (route) {
      window.location.href = route
    }
  }

  return (
    <>
      {children}
      <SearchPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tasks={tasks}
        ideas={ideas}
        goals={goals}
        certificates={certificates}
        notes={notes}
        music={music}
        devEntries={devEntries}
        performanceEntries={performanceEntries}
        onSelect={handleSelect}
      />
    </>
  )
}
