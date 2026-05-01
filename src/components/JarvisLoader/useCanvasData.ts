import { useState, useEffect, useCallback } from 'react'

interface Announcement {
  course: string
  title: string
  posted: string
  author: string
}

interface Assignment {
  course: string
  title: string
  due: string
  submitted: boolean
  urgency: 'critical' | 'warning' | 'normal'
}

export function useCanvasData(canvasDomain: string, canvasToken: string, courseIds: string[]) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!canvasDomain || !canvasToken || !courseIds.length) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const headers = {
        'Authorization': `Bearer ${canvasToken}`
      }

      // Fetch announcements
      const annPromises = courseIds.map(async (courseId) => {
        try {
          const res = await fetch(
            `https://${canvasDomain}/api/v1/announcements?context_codes[]=course_${courseId}&per_page=3`,
            { headers, signal: AbortSignal.timeout(5000) }
          )
          if (!res.ok) return []
          const data = await res.json()
          return data.map((a: any) => ({
            course: a.context_name || 'Unknown Course',
            title: a.title,
            posted: timeAgo(new Date(a.posted_at)),
            author: a.user_name || 'Unknown'
          }))
        } catch (e) {
          return []
        }
      })

      // Fetch assignments due within 72 hours
      const assignPromises = courseIds.map(async (courseId) => {
        try {
          const res = await fetch(
            `https://${canvasDomain}/api/v1/courses/${courseId}/assignments?bucket=upcoming&per_page=10&order_by=due_at`,
            { headers, signal: AbortSignal.timeout(5000) }
          )
          if (!res.ok) return []
          const data = await res.json()

          const now = new Date()
          const in72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000)

          return data
            .filter((a: any) => {
              if (!a.due_at) return false
              const due = new Date(a.due_at)
              return due >= now && due <= in72Hours
            })
            .map((a: any) => {
              const due = new Date(a.due_at)
              const diff = due.getTime() - now.getTime()
              const hours = diff / (1000 * 60 * 60)

              let urgency: 'critical' | 'warning' | 'normal' = 'normal'
              if (diff <= 0) urgency = 'critical'
              else if (hours <= 24) urgency = 'warning'

              return {
                course: a.course_name || 'Unknown Course',
                title: a.name,
                due: formatDueDate(due),
                submitted: a.has_submitted_submissions || false,
                urgency
              }
            })
        } catch (e) {
          return []
        }
      })

      const [annResults, assignResults] = await Promise.all([
        Promise.all(annPromises),
        Promise.all(assignPromises)
      ])

      const flatAnns = annResults.flat().slice(0, 2)
      const flatAssigns = assignResults.flat().sort((a, b) =>
        new Date(a.due).getTime() - new Date(b.due).getTime()
      )

      setAnnouncements(flatAnns)
      setAssignments(flatAssigns)
    } catch (e) {
      console.error('Canvas fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }, [canvasDomain, canvasToken, courseIds])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { announcements, assignments, loading, refetch: fetchData }
}

function timeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatDueDate(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `In ${days}d ${hours % 24}h`
  if (hours > 0) return `In ${hours}h ${Math.floor((diff % 3600000) / 60000)}m`
  return `In ${Math.floor(diff / 60000)}m`
}
