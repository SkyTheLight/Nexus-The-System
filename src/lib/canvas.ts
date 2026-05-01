const CANVAS_API_URL = process.env.CANVAS_API_URL || 'https://ciit.instructure.com/api/v1'
const CANVAS_TOKEN = process.env.CANVAS_ACCESS_TOKEN || ''

async function canvasFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${CANVAS_API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CANVAS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    console.error(`Canvas API error: ${response.status} ${response.statusText} for ${url}`)
    throw new Error(`Canvas API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export interface CanvasAssignment {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  due_at?: string
  has_submitted_submissions: boolean
  points_possible: number
  course_id: number
  course_name?: string
}

export interface CanvasCourse {
  id: number
  name: string
  course_code: string
}

export async function getCourses(): Promise<CanvasCourse[]> {
  return canvasFetch('/courses?enrollment_state=active&per_page=100')
}

export async function getAssignments(courseId: number): Promise<CanvasAssignment[]> {
  return canvasFetch(`/courses/${courseId}/assignments?order_by=due_at&per_page=100`)
}

export async function getAllAssignments(): Promise<CanvasAssignment[]> {
  const courses = await getCourses()
  const allAssignments: CanvasAssignment[] = []

  for (const course of courses) {
    try {
      const assignments = await getAssignments(course.id)
      assignments.forEach(a => { a.course_name = course.name })
      allAssignments.push(...assignments)
    } catch (error) {
      console.error(`Failed to fetch assignments for course ${course.name}:`, error)
    }
  }

  return allAssignments.sort((a, b) => {
    if (!a.due_at && !b.due_at) return 0
    if (!a.due_at) return 1
    if (!b.due_at) return -1
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
  })
}

export async function getPlannerItems(): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const endDate = nextMonth.toISOString().split('T')[0]

  return canvasFetch(`/planner/planner_items?start_date=${today}&end_date=${endDate}`)
}
