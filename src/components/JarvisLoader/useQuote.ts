import { useState, useEffect, useCallback } from 'react'
import { FALLBACK_QUOTES, getFallbackQuote } from './config'

interface QuoteData {
  quote: string
  author: string
}

export function useQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchQuote = useCallback(async () => {
    setLoading(true)

    try {
      const res = await fetch('https://zenquotes.io/api/random', {
        signal: AbortSignal.timeout(5000)
      })

      if (res.ok) {
        const data = await res.json()
        // zenquotes returns [{ q: "quote", a: "author" }]
        const item = Array.isArray(data) ? data[0] : data
        if (item?.q) {
          setQuote({ quote: item.q, author: item.a || 'Unknown' })
          return
        }
      }
    } catch (e) {
      console.error('Quote fetch failed:', e)
    }

    // Fallback to local quotes
    setQuote(getFallbackQuote())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  return { quote, loading, refetch: fetchQuote }
}
