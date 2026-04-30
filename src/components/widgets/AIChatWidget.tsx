import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { getDashboardLayout, saveDashboardLayout } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function AIChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m ARISE, your AI assistant. How can I help you today?',
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      })

      const data = await res.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Sorry, I couldn\'t process that.',
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error connecting to ARISE. Please try again.',
        timestamp: Date.now()
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-400" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7-4.5-7-4.5v9z"/>
        </svg>
        <span className="text-sm font-medium">AIRSE Chat</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-[#1a1a2e] border border-white/10'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-[#2a2a3e] flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} className="text-white/70" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-[#1a1a2e] border border-white/10 px-3 py-2 rounded-lg">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ARISE..."
          className="flex-1 px-3 py-2 bg-[#0B0B0C] border border-white/10 rounded-lg text-xs focus:outline-none focus:border-purple-500/50"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 py-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
