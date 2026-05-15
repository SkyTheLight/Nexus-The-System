'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-[#080808] border-b border-[#1f1f1f] px-6 h-10 flex items-center">
      <div className="flex items-center gap-5 text-xs font-mono">
        <Link
          href="/main"
          className={`tracking-wider uppercase transition-colors duration-150 ${
            pathname.startsWith('/main')
              ? 'text-[#00ff88]'
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
              ? 'text-[#00ff88]'
              : 'text-[#555] hover:text-[#888]'
          }`}
        >
          HUB
        </Link>
      </div>
    </nav>
  )
}
