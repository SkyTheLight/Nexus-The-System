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
    if (!canvasDomain || !canvasToken) {
      console.log('[Canvas] Missing domain or token, skipping fetch')
      setLoading(false)
      return
    }

    setLoading(true)

    let activeCourseIds = courseIds || []

    // Fetch active enrollments - isolated try/catch
    if (!courseIds || courseIds.length === 0) {
      try {
        const headers = { 'Authorization': `Bearer ${canvasToken}` }
        const enrollRes = await fetch(
          `https://${canvasDomain}/api/v1/courses?enrollment_state=active&per_page=50`,
          { headers, signal: AbortSignal.timeout(5000) }
        )
        if (enrollRes.ok) {
          const courses = await enrollRes.json()
          activeCourseIds = Array.isArray(courses) ? courses.map((c: any) => c.id.toString()) : []
          console.log('[Canvas] Found courses:', activeCourseIds)
        }
      } catch (e) {
        console.error('[Canvas] Failed to fetch enrollments:', e)
        // Continue with empty course list - don't block
      }
    }

    // Fetch announcements - isolated try/catch
    try {
      if (activeCourseIds.length > 0) {
        const headers = { 'Authorization': `Bearer ${canvasToken}` }
        const contextCodes = activeCourseIds.map(id => `course_${id}`)
        const annUrl = `https://${canvasDomain}/api/v1/announcements?${contextCodes.map(c => `context_codes[]=${c}`).join('&')}&per_page=5`

        console.log('[Canvas] Fetching announcements...')

        const annRes = await fetch(annUrl, { headers, signal: AbortSignal.timeout(5000) })
        if (annRes.ok) {
          const data = await annRes.json()
          const anns = Array.isArray(data) ? data : []
          const mapped = anns.slice(0, 2).map((a: any) => ({
            course: a.context_name || 'Unknown Course',
            title: a.title,
            posted: timeAgo(new Date(a.posted_at)),
            author: a.user_name || 'Unknown'
          }))
          setAnnouncements(mapped)
        }
      }
    } catch (e) {
      console.error('[Canvas] Announcements error:', e)
      // Don't block - continue
    }

    // Fetch assignments - isolated try/catch
    try {
      if (activeCourseIds.length > 0) {
        const headers = { 'Authorization': `Bearer ${canvasToken}` }
        const now = new Date()
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        console.log('[Canvas] Fetching assignments...')

        const assignPromises = activeCourseIds.map(async (courseId) => {
          try {
            const res = await fetch(
              `https://${canvasDomain}/api/v1/courses/${courseId}/assignments?bucket=upcoming&per_page=10&order_by=due_at`,
              { headers, signal: AbortSignal.timeout(5000) }
            )
            if (!res.ok) return []

            const data = await res.json()

            // Robust guard: handle various response shapes (Bug 2 fix)
            const list = Array.isArray(data) ? data :
              Array.isArray((data as any)?.assignments) ? (data as any).assignments :
              Array.isArray((data as any)?.data) ? (data as any).data :
              []

            return list
              .filter((a: any) => {
                if (!a.due_at) return false
                const due = new Date(a.due_at)
                return due >= now && due <= in7Days && !a.has_submitted_submissions
              })
              .map((a: any) => {
                const due = new Date(a.due_at)
                const diff = due.getTime() - now.getTime()
                const hours = diff / (1000 * 60 * 60)

                let urgency: 'critical' | 'warning' | 'normal' = 'normal'
                if (hours <= 24) urgency = 'critical'
                else if (hours <= 48) urgency = 'warning'

                return {
                  course: a.course_name || 'Unknown Course',
                  title: a.name,
                  due: formatDueDate(due),
                  submitted: a.has_submitted_submissions || false,
                  urgency
                }
              })
          } catch (e) {
            return [] // Isolate per-course failure
          }
        })

        const assignResults = await Promise.all(assignPromises)
        const flatAssigns = assignResults.flat().sort((a: any, b: any) =>
          new Date(a.due).getTime() - new Date(b.due).getTime()
        )

        console.log('[Canvas] Assignments found:', flatAssigns.length)
        setAssignments(flatAssigns)
      }
    } catch (e) {
      console.error('[Canvas] Assignments error:', e)
      // Don't block - continue
    }

    // Always set loading to false (Bug 1 & 5 fix - stage always advances)
    setLoading(false)
  }, [canvasDomain, canvasToken, courseIds])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { announcements, assignments, canvasLoading: loading, refetch: fetchData }
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
