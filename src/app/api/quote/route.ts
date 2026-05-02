export const runtime = 'nodejs'

export async function GET() {
  try {
    const res = await fetch('https://zenquotes.io/api/random', {
      next: { revalidate: 3600 }
    })
    if (!res.ok) throw new Error('ZenQuotes API failed')
    const data = await res.json()
    const item = Array.isArray(data) ? data[0] : data
    if (!item?.q) throw new Error('Invalid response from ZenQuotes')
    return Response.json({
      content: item.q,
      author: item.a || 'Unknown'
    })
  } catch (e) {
    console.error('Quote API error:', e)
    return Response.json({
      content: 'The secret of getting ahead is getting started.',
      author: 'Mark Twain'
    })
  }
}
