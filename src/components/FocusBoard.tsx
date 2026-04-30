'use client'

import { LayoutDashboard, Target, Lightbulb, CheckSquare } from 'lucide-react'

export default function FocusBoard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Focus Board</h1>
        <p className="text-muted-foreground">Your command center for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SectionCard
          title="Today's Tasks"
          icon={CheckSquare}
          count={3}
          items={['Review PR #42', 'Deploy API updates', 'Write documentation']}
        />
        <SectionCard
          title="Active Goals"
          icon={Target}
          count={2}
          items={['Complete TypeScript course', 'Build MVP for Project X']}
        />
        <SectionCard
          title="Top Ideas"
          icon={Lightbulb}
          count={2}
          items={['AI-powered code review', 'Habit tracking app']}
        />
      </div>
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  count,
  items,
}: {
  title: string
  icon: any
  count: number
  items: string[]
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-accent-foreground/20 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-muted-foreground" />
        <h3 className="font-semibold">{title}</h3>
        <span className="ml-auto text-xs bg-accent px-2 py-1 rounded">{count}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 bg-muted-foreground rounded-full shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
