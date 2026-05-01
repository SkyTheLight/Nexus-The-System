import { NextRequest, NextResponse } from 'next/server'
import { getSB } from '@/lib/api'
import { getCourses, getAssignments, type CanvasAssignment } from '@/lib/canvas'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSB()

    // Fetch all assignments from Canvas
    const courses = await getCourses()
    const allAssignments: CanvasAssignment[] = []

    for (const course of courses) {
      try {
        const assignments = await getAssignments(course.id)
        assignments.forEach(a => { a.course_name = course.name })
        allAssignments.push(...assignments)
      } catch (error) {
        console.error(`Failed to fetch assignments for ${course.name}:`, error)
      }
    }

    // Transform assignments to match actual table structure
    const assignmentsToSync = allAssignments.map(a => ({
      title: a.name,
      deadline: a.due_at || null,
      status: a.has_submitted_submissions ? 'submitted' : 'pending',
      canvas_assignment_id: a.id,
      canvas_course_id: a.course_id,
    }))

    // Insert assignments
    if (assignmentsToSync.length > 0) {
      const { error } = await supabase
        .from('assignments')
        .upsert(assignmentsToSync, {
          onConflict: 'canvas_assignment_id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Supabase error:', error)
        // If column doesn't exist, try without canvas fields
        if (error.message.includes('canvas_assignment_id')) {
          const assignmentsWithoutCanvas = assignmentsToSync.map(a => {
            const { canvas_assignment_id, canvas_course_id, ...rest } = a
            return rest
          })
          const { error: retryError } = await supabase
            .from('assignments')
            .insert(assignmentsWithoutCanvas)
          if (retryError) {
            return NextResponse.json({ error: retryError.message }, { status: 500 })
          }
        } else {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: assignmentsToSync.length,
      message: 'Assignments synced successfully'
    })
  } catch (error: any) {
    console.error('Canvas sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
