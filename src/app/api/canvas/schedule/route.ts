import { NextRequest, NextResponse } from 'next/server'
import { getCourses } from '@/lib/canvas'

export async function GET(request: NextRequest) {
  try {
    const courses = await getCourses()
    
    // Fetch today's schedule for each course
    const schedulePromises = courses.map(async (course) => {
      try {
        // Get course calendar events for today
        const today = new Date().toISOString().split('T')[0]
        const events = await fetch(
          `${process.env.CANVAS_API_URL}/courses/${course.id}/calendar_events?start_date=${today}&end_date=${today}`,
          { headers: { 'Authorization': `Bearer ${process.env.CANVAS_ACCESS_TOKEN}` } }
        ).then(res => res.json())

        return {
          course_name: course.name,
          course_code: course.course_code,
          events: (events || []).filter((e: any) => 
            e.type === 'event' || e.type === 'assignment'
          ).map((e: any) => ({
            title: e.title,
            start: e.start_at,
            end: e.end_at,
            location: e.location || 'TBA',
            type: e.type
          }))
        }
      } catch {
        return { course_name: course.name, course_code: course.course_code, events: [] }
      }
    })

    const schedules = await Promise.all(schedulePromises)
    const todayClasses = schedules.filter(s => s.events.length > 0)

    return NextResponse.json({ data: todayClasses })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
