import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    envVars: {
      hasApiUrl: !!process.env.CANVAS_API_URL,
      hasToken: !!process.env.CANVAS_ACCESS_TOKEN,
      apiUrl: process.env.CANVAS_API_URL || 'NOT SET',
      tokenPreview: process.env.CANVAS_ACCESS_TOKEN ? 
        process.env.CANVAS_ACCESS_TOKEN.substring(0, 10) + '...' : 'NOT SET',
    },
    tests: []
  }

  // Test 1: Direct fetch to Canvas API
  try {
    const url = `${process.env.CANVAS_API_URL || 'https://ciit.instructure.com/api/v1'}/courses`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.CANVAS_ACCESS_TOKEN || ''}`,
      },
    })
    
    results.tests.push({
      name: 'Canvas API direct fetch',
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (response.ok) {
      const data = await response.json()
      results.tests[results.tests.length - 1].coursesCount = data.length
    } else {
      const text = await response.text()
      results.tests[results.tests.length - 1].error = text.substring(0, 200)
    }
  } catch (error: any) {
    results.tests.push({
      name: 'Canvas API direct fetch',
      error: error.message,
    })
  }

  return NextResponse.json(results)
}
