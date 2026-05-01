import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasApiUrl: !!process.env.CANVAS_API_URL,
    hasToken: !!process.env.CANVAS_ACCESS_TOKEN,
    apiUrlLength: process.env.CANVAS_API_URL?.length || 0,
    tokenLength: process.env.CANVAS_ACCESS_TOKEN?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  })
}
