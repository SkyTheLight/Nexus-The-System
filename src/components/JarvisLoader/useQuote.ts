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
      const res = await fetch('https://api.quotable.io/random?tags=success|wisdom|education', {
        signal: AbortSignal.timeout(5000)
      })

      if (res.ok) {
        const data = await res.json()
        setQuote({ quote: data.content, author: data.author })
        return
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
