'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import {
  LayoutDashboard,
  CheckSquare,
  Lightbulb,
  Target,
  Award,
  FileText,
  Music,
  Calendar,
  Code,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Bot,
} from 'lucide-react'

const navigation = [
  { href: '/', label: 'Focus Board', icon: LayoutDashboard },
  { href: '/todos', label: 'To-Do', icon: CheckSquare },
  { href: '/ideas', label: 'App Ideas', icon: Lightbulb },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/music', label: 'Music', icon: Music },
  { href: '/timeline', label: 'Timeline', icon: Calendar },
  { href: '/dev', label: 'Dev Mode', icon: Code },
  { href: '/performance', label: 'Performance', icon: Gamepad2 },
  { href: '/logs', label: 'Logs', icon: Trash2 },
  { href: '/ai-logs', label: 'AI Logs', icon: Bot },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-muted border-r border-border transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <span className="font-semibold text-lg">Adversity</span>}
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent ${
                pathname === item.href ? 'bg-accent text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={18} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
