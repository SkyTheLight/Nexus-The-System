'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Quote = {
  text: string
  character: string
  category: "discipline" | "revenge" | "freedom" | "dominance" | "mindset"
}

const quotes: Quote[] = [
  // Thomas Shelby
  { text: "You don’t get what you deserve. You get what you take.", character: "Thomas Shelby", category: "dominance" },
  { text: "Lies travel faster than truth. But they don’t last as long.", character: "Thomas Shelby", category: "mindset" },
  { text: "I’m not a traitor to my class. I am an extreme example of what a man can become.", character: "Thomas Shelby", category: "discipline" },

  // Sung Jin-Woo
  { text: "I will become stronger. No matter what it takes.", character: "Sung Jin-Woo", category: "discipline" },
  { text: "If I survive today, I get stronger tomorrow.", character: "Sung Jin-Woo", category: "mindset" },
  { text: "There is no shortcut to becoming strong.", character: "Sung Jin-Woo", category: "discipline" },

  // Levi Ackerman
  { text: "The only thing we’re allowed to do is believe we won.", character: "Levi Ackerman", category: "dominance" },
  { text: "Choose. Regret it or die with it.", character: "Levi Ackerman", category: "discipline" },
  { text: "I don’t care what happens. I move forward.", character: "Levi Ackerman", category: "freedom" },

  // Eren Yeager
  { text: "Keep moving forward.", character: "Eren Yeager", category: "mindset" },
  { text: "If you win, you live. If you lose, you die.", character: "Eren Yeager", category: "dominance" },

  // Kratos
  { text: "Don’t be sorry. Be better.", character: "Kratos", category: "discipline" },
  { text: "Fate does not decide. I do.", character: "Kratos", category: "freedom" },

  // Edit-style originals
  { text: "Silence built him. Pain shaped him.", character: "Unknown", category: "mindset" },
  { text: "No destiny. Only decisions.", character: "Unknown", category: "freedom" },
]

export default function QuoteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    if (quotes.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % quotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextQuote = () => {
    setCurrentIndex(prev => (prev + 1) % quotes.length)
  }

  const prevQuote = () => {
    setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length)
  }

  const randomQuote = () => {
    if (quotes.length <= 1) return
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * quotes.length)
    } while (newIndex === currentIndex)
    setCurrentIndex(newIndex)
    setIsGlitching(true)
    setTimeout(() => setIsGlitching(false), 300)
  }

  return (
    <div className="w-full bg-[#0B0B0C] border border-white/10 rounded-2xl p-4 space-y-3">
      {/* Carousel */}
      <div className="relative w-full h-[100px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              ...(isGlitching && {
                x: [0, -1, 1, -1, 0],
                transition: { duration: 0.3 }
              })
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-center px-4"
          >
            <p className={`text-sm md:text-base font-medium leading-tight mb-1
              ${isGlitching ? 'text-purple-400' : 'text-gray-300'}`}
            >
              "{quotes[currentIndex].text}"
            </p>
            <p className="text-xs text-muted-foreground opacity-75">
              — {quotes[currentIndex].character}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <button onClick={prevQuote} className="absolute left-0 p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors" aria-label="Previous">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={nextQuote} className="absolute right-0 p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors" aria-label="Next">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Random Button */}
      <button
        onClick={randomQuote}
        disabled={quotes.length <= 1}
        className="w-full px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-all disabled:opacity-50"
      >
        Random Quote
      </button>
    </div>
  )
}
