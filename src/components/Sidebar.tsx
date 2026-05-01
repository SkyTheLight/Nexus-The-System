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
  {
    section: 'MAIN',
    items: [
      { href: '/', label: 'Focus Board', icon: LayoutDashboard },
      { href: '/todos', label: 'To-Do', icon: CheckSquare },
      { href: '/goals', label: 'Goals', icon: Target },
    ]
  },
  {
    section: 'CREATE',
    items: [
      { href: '/ideas', label: 'App Ideas', icon: Lightbulb },
      { href: '/notes', label: 'Notes', icon: FileText },
      { href: '/music', label: 'Music', icon: Music },
    ]
  },
  {
    section: 'TRACK',
    items: [
      { href: '/timeline', label: 'Timeline', icon: Calendar },
      { href: '/performance', label: 'Performance', icon: Gamepad2 },
      { href: '/logs', label: 'Logs', icon: Trash2 },
      { href: '/certificates', label: 'Certificates', icon: Award },
    ]
  },
  {
    section: 'DEV',
    items: [
      { href: '/dev', label: 'Dev Mode', icon: Code },
      { href: '/ai-logs', label: 'AI Logs', icon: Bot },
    ]
  }
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen sidebar transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-[#ffffff0f] flex items-center justify-between">
          {sidebarOpen && <span className="font-semibold text-lg text-white">Adversity</span>}
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-[#ffffff0f] rounded-md transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navigation.map((section, index) => (
            <div key={section.section}>
              {index > 0 && <div className="sidebar-separator" />}
              {sidebarOpen && (
                <div className="sidebar-section-label mt-2">{section.section}</div>
              )}
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-item ${
                    pathname === item.href ? 'active' : ''
                  }`}
                >
                  <item.icon size={16} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
