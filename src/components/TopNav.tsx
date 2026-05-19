'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopNav() {
  const pathname = usePathname()
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const ph = new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now)
      setTime(ph)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-[#06060a] border-b border-[rgba(215,179,106,0.18)] px-6 h-10 flex items-center justify-between">
      <div className="flex items-center gap-5 text-xs font-mono">
        <Link
          href="/main"
          className={`tracking-wider uppercase transition-colors duration-150 ${
            pathname.startsWith('/main')
              ? 'text-[#d7b36a]'
              : 'text-[#555] hover:text-[#888]'
          }`}
        >
          MAIN
        </Link>
        <span className="text-[#1f1f1f]">|</span>
        <Link
          href="/hub"
          className={`tracking-wider uppercase transition-colors duration-150 ${
            pathname.startsWith('/hub')
              ? 'text-[#d7b36a]'
              : 'text-[#555] hover:text-[#888]'
          }`}
        >
          HUB
        </Link>
      </div>
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-[#555] tabular-nums">{time}</span>
      </div>
    </nav>
  )
}
