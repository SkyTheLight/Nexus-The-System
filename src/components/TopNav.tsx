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
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(now)
      setTime(ph)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <nav className="sticky top-0 z-50 h-[40px] bg-[#05050d] border-b border-[var(--sl-border)] px-6 flex items-center justify-between">
      <div className="flex items-center gap-5 text-xs">
        <Link href="/main" className={`font-['Cinzel'] tracking-widest uppercase transition-colors duration-150 ${
          pathname?.startsWith('/main') ? 'text-[var(--sl-gold)]' : 'text-[var(--sl-text-muted)] hover:text-[var(--sl-gold)]'
        }`}>
          MAIN
        </Link>
        <span className="text-[var(--sl-text-dim)]">◈</span>
        <Link href="/hub" className={`font-['Cinzel'] tracking-widest uppercase transition-colors duration-150 ${
          pathname?.startsWith('/hub') ? 'text-[var(--sl-gold)]' : 'text-[var(--sl-text-muted)] hover:text-[var(--sl-gold)]'
        }`}>
          HUB
        </Link>
      </div>
      <div className="flex items-center gap-3 text-xs font-['JetBrains_Mono']">
        <span className="text-[var(--sl-text-dim)]">[PH TIME]</span>
        <span className="text-[var(--sl-gold)] tabular-nums">{time}</span>
      </div>
    </nav>
  )
}
