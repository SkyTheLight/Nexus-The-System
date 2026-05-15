import { NextResponse } from 'next/server'

const FALLBACK_NEWS = [
  { title: 'No connection to news service', summary: 'Anthropic API key not configured. News cannot be fetched.', category: 'tech', urgency: 'low' },
]

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({ news: FALLBACK_NEWS, cached: true })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        tools: [{
          type: 'web_search',
          name: 'web_search',
        }],
        messages: [{
          role: 'user',
          content: 'Search for today\'s most important news in the Philippines that a young Filipino developer should know about. Focus on: weather disturbances (typhoons/LPA), tech industry news PH, government advisories, economic news, Metro Manila alerts. Return as JSON array: [{title, summary, category, urgency}]. Max 5 items. urgency: high/medium/low. Return ONLY the JSON array, no other text.',
        }],
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ news: FALLBACK_NEWS, cached: true })
    }

    const data = await res.json()

    const text = data.content?.[0]?.text
    let news
    try {
      news = text ? JSON.parse(text) : FALLBACK_NEWS
    } catch {
      news = FALLBACK_NEWS
    }

    return NextResponse.json({ news, cached: false })
  } catch {
    return NextResponse.json({ news: FALLBACK_NEWS, cached: true })
  }
}
