'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Quote = {
  text: string
  character: string
  category: 'discipline' | 'revenge' | 'freedom' | 'mindset'
}

const quotes: Quote[] = [
  // Thomas Shelby
  { text: "You don't get what you deserve. You get what you take.", character: "Thomas Shelby", category: "dominance" },
  { text: "Lies travel faster than truth. But they don't last as long.", character: "Thomas Shelby", category: "mindset" },
  { text: "I'm not a traitor to my class. I am an extreme example of what a man can become.", character: "Thomas Shelby", category: "discipline" },
  // Sung Jin-Woo
  { text: "I will become stronger. No matter what it takes.", character: "Sung Jin-Woo", category: "discipline" },
  { text: "If I survive today, I get stronger tomorrow.", character: "Sung Jin-Woo", category: "mindset" },
  { text: "There is no shortcut to becoming strong.", character: "Sung Jin-Woo", category: "discipline" },
  // Levi Ackerman
  { text: "The only thing we're allowed to do is believe we won.", character: "Levi Ackerman", category: "dominance" },
  { text: "Choose. Regret it or die with it.", character: "Levi Ackerman", category: "discipline" },
  { text: "I don't care what happens. I move forward.", character: "Levi Ackerman", category: "freedom" },
  // Eren Yeager
  { text: "Keep moving forward.", character: "Eren Yeager", category: "mindset" },
  { text: "If you win, you live. If you lose, you die.", character: "Eren Yeager", category: "dominance" },
  // Kratos
  { text: "Don't be sorry. Be better.", character: "Kratos", category: "discipline" },
  { text: "Fate does not decide. I do.", character: "Kratos", category: "freedom" },
  // Edit-style originals
  { text: "Silence built him. Pain shaped him.", character: "Unknown", category: "mindset" },
  { text: "No destiny. Only decisions.", character: "Unknown", category: "freedom" },
]

export default function QuoteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (quotes.length <= 1) return
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % quotes.length)
        setIsAnimating(false)
      }, 150)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const nextQuote = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % quotes.length)
      setIsAnimating(false)
    }, 150)
  }

  const prevQuote = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length)
      setIsAnimating(false)
    }, 150)
  }

  const randomQuote = () => {
    if (quotes.length <= 1) return
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * quotes.length)
    } while (newIndex === currentIndex)
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(newIndex)
      setIsAnimating(false)
    }, 300)
  }

  return (
    <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 space-y-3">
      {/* Quote */}
      <div className="relative w-full min-h-[80px] flex items-center justify-center">
        <div
          key={currentIndex}
          className={`text-center px-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
        >
          <p className="quote-text">"{quotes[currentIndex].text}"</p>
          <p className="quote-author">— {quotes[currentIndex].character}</p>
        </div>

        {/* Navigation */}
        <button onClick={prevQuote} className="absolute left-0 p-1 rounded-full bg-[var(--color-border)] hover:bg-[var(--color-border-hover)] transition-colors" aria-label="Previous">
          <ChevronLeft size={14} className="text-[var(--color-text-muted)]" />
        </button>
        <button onClick={nextQuote} className="absolute right-0 p-1 rounded-full bg-[var(--color-border)] hover:bg-[var(--color-border-hover)] transition-colors" aria-label="Next">
          <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* Random Button */}
      <button
        onClick={randomQuote}
        disabled={quotes.length <= 1}
        className="pomodoro-reset w-full"
      >
        Random Quote
      </button>
    </div>
  )
}
