'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, MessageSquare } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function JarvisChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, Sir. I am experiencing technical difficulties: ' + error.message
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full transition-all duration-300 shadow-lg
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-90' 
            : 'bg-gradient-to-br from-red-500 to-orange-600 hover:scale-110 hover:shadow-red-500/50'
          }`}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageSquare size={24} className="text-white" />
        )}
        {/* Pulse animation */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-[#0B0B0C] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/20 flex flex-col overflow-hidden">
          {/* Header with JARVIS Animation */}
          <div className="p-4 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 to-orange-500/10">
            <div className="flex items-center gap-3">
              {/* JARVIS AI Animation */}
              <div className="jarvis-ai-container">
                <div className="jarvis-ring jarvis-ring-1"></div>
                <div className="jarvis-ring jarvis-ring-2"></div>
                <div className="jarvis-orb jarvis-orb-1"></div>
                <div className="jarvis-orb jarvis-orb-2"></div>
                <div className="jarvis-orb jarvis-orb-3"></div>
                <div className="jarvis-orb jarvis-orb-4"></div>
              </div>

              <div>
                <h3 className="font-medium text-white">ARISE</h3>
                <p className="text-xs text-muted-foreground">Adaptive Response & Intelligent Shadow Engine</p>
              </div>
              {/* Status light */}
              <div className="ml-auto">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'} block`} />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-8">
                <div className="jarvis-ai-container mx-auto mb-4">
                  <div className="jarvis-orb jarvis-orb-1"></div>
                  <div className="jarvis-orb jarvis-orb-2"></div>
                  <div className="jarvis-orb jarvis-orb-3"></div>
                  <div className="jarvis-orb jarvis-orb-4"></div>
                </div>
                <p>Good day, Sir. I am ARISE (Adaptive Response & Intelligent Shadow Engine). How may I assist you?</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-red-500/20 text-white rounded-br-sm'
                      : 'bg-[#111113] border border-red-500/20 text-gray-300 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#111113] border border-red-500/20 p-3 rounded-2xl rounded-bl-sm">
                  <div className="jarvis-thinking">
                    <div className="jarvis-thinking-orb"></div>
                    <div className="jarvis-thinking-orb"></div>
                    <div className="jarvis-thinking-orb"></div>
                      <span className="text-xs text-muted-foreground ml-2">ARISE is processing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-red-500/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ARISE..."
                className="flex-1 bg-[#111113] border border-red-500/20 rounded-lg px-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-red-500/50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={18} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
