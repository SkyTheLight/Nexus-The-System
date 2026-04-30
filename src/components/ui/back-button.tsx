'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 group flex items-center gap-1.5"
      aria-label="Go back"
    >
      <ArrowLeft size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Back</span>
    </button>
  )
}
