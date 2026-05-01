import { NextRequest, NextResponse } from 'next/server'
import { getCourses, getAssignments } from '@/lib/canvas'
import { getSB } from '@/lib/api'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CANVAS_CRON_SECRET

  if (cronSecret && authHeader !== 'Bearer ' + cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSB()
    const courses = await getCourses()
    const allAssignments: any[] = []

    for (const course of courses) {
      try {
        const assignments = await getAssignments(course.id)
        assignments.forEach((a: any) => {
          a.course_name = course.name
          allAssignments.push(a)
        })
      } catch (error) {
        console.error(`Failed to fetch ${course.name}:`, error)
      }
    }

    const toSync = allAssignments.map(a => ({
      title: a.name,
      deadline: a.due_at || null,
      status: a.has_submitted_submissions ? 'submitted' : 'pending',
      canvas_assignment_id: a.id,
      canvas_course_id: a.course_id,
    }))

    if (toSync.length > 0) {
      const { error } = await supabase
        .from('assignments')
        .upsert(toSync, {
          onConflict: 'canvas_assignment_id',
          ignoreDuplicates: false
        })

      if (error) {
        if (error.message.includes('canvas_assignment_id')) {
          const { error: fallbackError } = await supabase
            .from('assignments')
            .upsert(
              toSync.map(({ canvas_assignment_id, canvas_course_id, ...rest }: any) => rest)
            )
          if (fallbackError) {
            return NextResponse.json({ error: fallbackError.message }, { status: 500 })
          }
        } else {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: toSync.length,
      message: 'Auto-sync completed'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
