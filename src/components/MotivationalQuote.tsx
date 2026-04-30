'use client'

import { useState, useEffect } from 'react'
import { Quote } from 'lucide-react'

const quotes = [
  // Thomas Shelby (Peaky Blinders)
  { text: "I told you. I don't have time for the paperwork of being good.", author: "Thomas Shelby" },
  { text: "Everyone's a whore, Grace. We just have different prices.", author: "Thomas Shelby" },
  { text: "I'm not a traitor to my class. I'm just an extreme example of what a working man can achieve.", author: "Thomas Shelby" },
  { text: "The only way to do great work is to love what you do.", author: "Thomas Shelby" },
  { text: "Fear is the only true enemy of success.", author: "Thomas Shelby" },

  // Sung Jin-Woo (Solo Leveling)
  { text: "I will be the one to clear this dungeon.", author: "Sung Jin-Woo" },
  { text: "From now on, I will be strong enough that no one will be able to kill me.", author: "Sung Jin-Woo" },
  { text: "I don't need luck. I make my own destiny.", author: "Sung Jin-Woo" },
  { text: "The weak fear the strong. The strong fear the stronger.", author: "Sung Jin-Woo" },
  { text: "Every day, I grow stronger. That is my only purpose.", author: "Sung Jin-Woo" },

  // Additional Powerful Characters
  { text: "It's not about the gear, it's about the man who wears it.", author: "Tony Stark" },
  { text: "I am inevitable.", author: "Thanos" },
  { text: "With great power comes great responsibility.", author: "Uncle Ben" },
  { text: "I am whatever Gotham needs me to be.", author: "Batman" },
  { text: "The night is darkest just before the dawn. I promise you, the dawn is coming.", author: "Harvey Dent" },

  // Classic Motivational
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Try not to become a man of success, but rather try to become a man of value.", author: "Albert Einstein" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
]

export default function MotivationalQuote() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % quotes.length)
    }, 30000) // Change quote every 30 seconds
    return () => clearInterval(timer)
  }, [])

  const quote = quotes[index]

  return (
    <div className="p-6 bg-[#0B0B0C] border border-white/10 rounded-2xl space-y-3">
      <div className="flex items-start gap-3">
        <Quote size={20} className="text-primary shrink-0 mt-1" />
        <div>
          <p className="text-lg text-gray-300 italic leading-relaxed">"{quote.text}"</p>
          <p className="text-sm text-muted-foreground mt-2">— {quote.author}</p>
        </div>
      </div>
    </div>
  )
}
