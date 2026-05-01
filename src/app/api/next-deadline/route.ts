import { NextRequest, NextResponse } from 'next/server'
import { getSB } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSB()
    const { data, error } = await supabase
      .from('assignments')
      .select('id, title, deadline, course')
      .gte('deadline', new Date().toISOString())
      .order('deadline', { ascending: true })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message })
  }
}
