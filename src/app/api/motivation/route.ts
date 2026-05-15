import { NextResponse } from 'next/server'

const FALLBACKS = [
  '"Build what scares you. That\'s where the growth is."',
  '"Stop planning. Start building. You already know enough."',
  '"The best time to ship was yesterday. The next best time is today."',
  '"Done is better than perfect. Ship it."',
  '"You\'re not behind. You\'re just on your own timeline."',
  '"Discipline > motivation. Show up even when you don\'t feel like it."',
  '"Your only competition is who you were yesterday."',
]

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
    return NextResponse.json({ motivation: fallback, cached: true })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: 'Give me one short, brutally honest motivational line for a Filipino developer who is building projects, growing his career, and improving himself. Max 25 words. No fluff. No quotes. Just the line.',
        }],
      }),
    })

    if (!res.ok) {
      const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
      return NextResponse.json({ motivation: fallback, cached: true })
    }

    const data = await res.json()
    const motivation = data.content?.[0]?.text?.trim() || FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]

    return NextResponse.json({ motivation, cached: false })
  } catch {
    const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
    return NextResponse.json({ motivation: fallback, cached: true })
  }
}
