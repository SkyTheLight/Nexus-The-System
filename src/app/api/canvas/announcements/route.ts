import { NextRequest, NextResponse } from 'next/server'
import { getCourses } from '@/lib/canvas'

export async function GET(request: NextRequest) {
  try {
    const courses = await getCourses()
    const allAnnouncements: any[] = []

    for (const course of courses) {
      try {
        const announcements = await fetch(
          `${process.env.CANVAS_API_URL}/courses/${course.id}/discussion_topics?only_announcements=true&per_page=10`,
          { headers: { 'Authorization': `Bearer ${process.env.CANVAS_ACCESS_TOKEN}` } }
        ).then(res => res.json())

        announcements.forEach((ann: any) => {
          allAnnouncements.push({
            id: ann.id,
            title: ann.title,
            message: ann.message || ann.discussion_subentry_count + ' replies',
            html_url: ann.html_url || `https://ciit.instructure.com/courses/${course.id}/discussion_topics/${ann.id}`,
            course_name: course.name,
            created_at: ann.created_at
          })
        })
      } catch (error) {
        console.error(`Failed to fetch announcements for ${course.name}:`, error)
      }
    }

    // Sort by date, most recent first
    allAnnouncements.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json(allAnnouncements.slice(0, 10))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
