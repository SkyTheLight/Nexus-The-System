'use client'

import { Plus } from 'lucide-react'

interface AddFloatingButtonProps {
  onClick: () => void
  label?: string
}

export default function AddFloatingButton({ onClick, label = 'Add' }: AddFloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
      title={label}
    >
      <Plus size={16} />
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}
