'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
    >
      <ChevronLeft size={16} />
      Back to Focus Board
    </Link>
  )
}
