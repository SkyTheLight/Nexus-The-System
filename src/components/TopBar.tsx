'use client'

import { Search, Plus } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="h-16 border-b border-border bg-muted flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <button className="w-full flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-muted-foreground hover:border-accent-foreground/20 transition-colors">
          <Search size={16} />
          <span className="text-sm">Search anything...</span>
          <kbd className="ml-auto text-xs bg-accent px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>
      <button className="ml-4 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
        <Plus size={18} />
      </button>
    </header>
  )
}
