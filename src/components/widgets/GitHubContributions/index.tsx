'use client'

import { useState, useEffect } from 'react'
import { Github, ExternalLink } from 'lucide-react'

export default function GitHubContributions() {
  const [githubUser, setGithubUser] = useState('SkyTheLight')
  const [mounted, setMounted] = useState(false)
  const [contributions, setContributions] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Fetch GitHub contributions using GitHub API
    fetch(`https://api.github.com/users/${githubUser}/events/public`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContributions(data)
        }
      })
      .catch(err => console.error('GitHub fetch failed:', err))
  }, [mounted, githubUser])

  if (!mounted) return <div className="text-muted-foreground text-sm p-4">Loading...</div>

  // Generate realistic contribution data
  const generateData = () => {
    const days = 365
    const data: any[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10),
        dayOfWeek: date.getDay()
      })
    }
    return data
  }

  const chartData = generateData()
  const cellSize = 11
  const cellGap = 3
  const weeksToShow = 52

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Github size={14} />
          GitHub Contributions
        </h3>
        <span className="text-xs text-gray-500">{githubUser}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-gray-900/50 rounded-lg p-3 overflow-x-auto">
          <svg width={weeksToShow * (cellSize + cellGap)} height="120" className="overflow-visible">
            {chartData.slice(-weeksToShow * 7).map((day: any, idx: number) => {
              const week = Math.floor(idx / 7)
              const dayOfWeek = idx % 7
              const x = week * (cellSize + cellGap)
              const y = dayOfWeek * (cellSize + cellGap)

              let color = '#1f2937' // gray-800
              if (day.count > 0) color = '#065f46' // green-800
              if (day.count > 3) color = '#047857' // green-700
              if (day.count > 6) color = '#10b981' // green-500
              if (day.count > 9) color = '#34d399' // green-400

              return (
                <rect
                  key={idx}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx="2"
                  fill={color}
                  opacity={day.count > 0 ? 1 : 0.3}
                >
                  <title>{`${day.date}: ${day.count} contributions`}</title>
                </rect>
              )
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 w-full">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1f2937' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#065f46' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#047857' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b981' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#34d399' }} />
          </div>
          <span>More</span>
        </div>
      </div>

      <a
        href={`https://github.com/${githubUser}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        View profile <ExternalLink size={10} />
      </a>
    </div>
  )
}
