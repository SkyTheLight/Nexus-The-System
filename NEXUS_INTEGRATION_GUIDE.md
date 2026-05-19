# Integration Guide: Migrating to NEXUS

This guide shows how to incrementally integrate NEXUS into your existing Adversity dashboard without breaking anything.

## Option 1: Zero Changes Required (Read-Only)

If you don't want to change anything right now, NEXUS is already there and ready:

1. **View the demo**: Visit `/nexus` to see NEXUS in action
2. **Read the docs**: Check `NEXUS.md` and `NEXUS_QUICKSTART.md`
3. **Plan your implementation**: Decide which dashboard to migrate first

No action needed - existing code works as-is.

## Option 2: Drop-In Replacement (Minimal Changes)

Replace `useGridLayout` with `useNexusLayout` in any dashboard:

### Before

```typescript
// src/app/main/page.tsx
import { useGridLayout } from '@/hooks/useGridLayout'
import GridLayout from 'react-grid-layout'
import { MAIN_DEFAULT_LAYOUTS } from '@/lib/layout'

export default function MainDashboard() {
  const { layouts, handleLayoutChange } = useGridLayout({
    page: 'main',
    defaultLayouts: MAIN_DEFAULT_LAYOUTS
  })

  return (
    <GridLayout
      layout={layouts.lg}
      onLayoutChange={handleLayoutChange}
      cols={12}
      rowHeight={80}
      width={containerWidth}
    >
      <div key="widget1">Widget 1</div>
      <div key="widget2">Widget 2</div>
    </GridLayout>
  )
}
```

### After (Just Change the Import!)

```typescript
// src/app/main/page.tsx
import { useNexusLayout } from '@/hooks/useNexusLayout'  // ← Changed
import GridLayout from 'react-grid-layout'
import { MAIN_DEFAULT_LAYOUTS } from '@/lib/layout'

export default function MainDashboard() {
  const { layouts, handleLayoutChange } = useNexusLayout({  // ← Changed
    page: 'main',
    defaultLayouts: MAIN_DEFAULT_LAYOUTS
  })

  return (
    <GridLayout
      layout={layouts.lg}
      onLayoutChange={handleLayoutChange}
      cols={12}
      rowHeight={80}
      width={containerWidth}
    >
      <div key="widget1">Widget 1</div>
      <div key="widget2">Widget 2</div>
    </GridLayout>
  )
}
```

**That's it!** Your dashboard now uses NEXUS with intelligent pressure-based constraints.

## Option 3: Custom Constraints (Advanced)

Add specific relationships between widgets:

```typescript
import { useNexusLayout } from '@/hooks/useNexusLayout'
import { NexusAdapter, createNexusWidget } from '@/lib/layout/nexusAdapter'
import GridLayout from 'react-grid-layout'

export default function MainDashboard() {
  const { layouts, handleLayoutChange, getAdapter } = useNexusLayout({
    page: 'main',
    defaultLayouts: MAIN_DEFAULT_LAYOUTS
  })

  // On mount, customize widgets with constraints
  useEffect(() => {
    const adapter = getAdapter()
    if (!adapter) return

    // Update widgets with specific relationships
    const engine = adapter.engine
    
    // Make focus-timer and focus-stats adjacent
    const timerWidget = engine.getResolvedWidgets().find(w => w.id === 'focus-timer')
    if (timerWidget) {
      engine.graph.updateWidget('focus-timer', {
        ...timerWidget,
        constraints: [
          {
            type: 'adjacent-to',
            target: 'focus-stats',
            direction: 'right',
            spacing: 16
          }
        ]
      })
      engine.reflow()
    }
  }, [getAdapter])

  return (
    <GridLayout
      layout={layouts.lg}
      onLayoutChange={handleLayoutChange}
      cols={12}
      rowHeight={80}
      width={containerWidth}
    >
      {/* Your widgets */}
    </GridLayout>
  )
}
```

## Option 4: Pure NEXUS (Full Control)

Use NEXUS directly without react-grid-layout:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { NexusEngine, NexusWidget } from '@/lib/layout/nexus'
import { createNexusWidget, NexusWidgetPresets } from '@/lib/layout/nexusAdapter'

export default function NexusDashboard() {
  const [engine] = useState(() => new NexusEngine(1200))
  const [layout, setLayout] = useState(new Map())

  useEffect(() => {
    // Initialize widgets
    const widgets: NexusWidget[] = [
      NexusWidgetPresets.priority('focus-timer'),
      NexusWidgetPresets.responsive('focus-stats'),
      NexusWidgetPresets.flexible('focus-heatmap')
    ]

    engine.init(widgets)
    setLayout(engine.getLayout())
  }, [engine])

  const handleWidgetResize = (id: string, width: number, height: number) => {
    engine.resizeWidget(id, width, height)
    setLayout(new Map(engine.getLayout()))
  }

  return (
    <div className='relative w-full h-screen'>
      {Array.from(layout.entries()).map(([id, pos]) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`
          }}
          className='bg-blue-500 rounded p-4 text-white'
          onMouseDown={(e) => {
            // Handle drag/resize
          }}
        >
          {id}
        </div>
      ))}
    </div>
  )
}
```

## Phased Migration Plan

### Phase 1: Try It Out (1 day)
- [ ] Visit `/nexus` demo page
- [ ] Read `NEXUS.md` and `NEXUS_QUICKSTART.md`
- [ ] Run existing dashboard - verify it still works

### Phase 2: Single Dashboard (1-2 days)
- [ ] Choose one dashboard (e.g., `/main`)
- [ ] Replace `useGridLayout` with `useNexusLayout`
- [ ] Test resizing/dragging
- [ ] Verify pressure visualization works
- [ ] Commit changes

### Phase 3: Add Constraints (2-3 days)
- [ ] Identify key widget relationships
- [ ] Add `adjacent-to`, `aligned-with` constraints
- [ ] Fine-tune flex properties (grow/shrink)
- [ ] Test responsive behavior at different widths
- [ ] Commit changes

### Phase 4: Other Dashboards (1 day per dashboard)
- [ ] Repeat Phase 2-3 for `/hub`, `/performance`, etc.
- [ ] Verify all existing functionality works
- [ ] Update documentation

### Phase 5: Persistence (Optional, 1 day)
- [ ] Export constraints from working dashboards
- [ ] Store in localStorage for durability
- [ ] Implement constraint restoration on page load
- [ ] Add UI for "Reset Layout" button

### Phase 6: Polish (Optional, 1-2 days)
- [ ] Add animations between constraint changes
- [ ] Implement constraint debugging UI
- [ ] Performance optimization if needed
- [ ] User documentation

## Testing Checklist

For each migrated dashboard:

- [ ] **Drag widgets**: Widgets move smoothly
- [ ] **Resize widgets**: Adjacent widgets respond intelligently
- [ ] **Container resize**: Widgets re-flow for new width
- [ ] **Mobile view**: Works on mobile screen sizes
- [ ] **Persistence**: Layout saves and restores
- [ ] **Performance**: No lag or jank during interactions
- [ ] **Accessibility**: Keyboard navigation works
- [ ] **Visual**: All widgets render correctly

## Rollback Instructions

If something breaks, rolling back is easy:

```typescript
// Simply switch back to old hook
import { useGridLayout } from '@/hooks/useGridLayout'

// Or clear NEXUS storage
localStorage.removeItem('nexus-main-constraints-v1')
localStorage.removeItem('nexus-hub-constraints-v1')
```

## Monitoring

Track NEXUS performance:

```typescript
// Get pressure history for analytics
const pressureHistory = engine.getPressureHistory()
console.log(`Total pressure events: ${pressureHistory.length}`)
console.log(`Average intensity: ${pressureHistory.reduce((s, p) => s + p.intensity, 0) / pressureHistory.length}`)

// Check convergence times
const startTime = performance.now()
const layout = engine.reflow()
const time = performance.now() - startTime
console.log(`Reflow took ${time}ms`)
```

## Common Integration Patterns

### Pattern 1: Hybrid (NEXUS + RGL)

Use NEXUS for constraint logic, RGL for dragging:

```typescript
const { layouts, handleLayoutChange } = useNexusLayout({...})

return (
  <GridLayout
    layout={layouts.lg}
    onLayoutChange={handleLayoutChange}
    isDraggable={true}
    isResizable={true}
  >
    {/* RGL handles interactions, NEXUS handles relationships */}
  </GridLayout>
)
```

### Pattern 2: NEXUS Only

Full control with pure NEXUS:

```typescript
const [layout, setLayout] = useState(new Map())

useEffect(() => {
  const adapter = new NexusAdapter(1200)
  adapter.initFromLayout(initialLayout)
  setLayout(adapter.getAsLayout())
}, [])

return (
  <div>
    {/* Your custom drag/resize handling */}
  </div>
)
```

### Pattern 3: Gradual Migration

Keep old code, add NEXUS features incrementally:

```typescript
const { layouts, handleLayoutChange } = useNexusLayout({...})
const [useNexusFeatures, setUseNexusFeatures] = useState(false)

return (
  <>
    {useNexusFeatures && <NexusVisualization />}
    <GridLayout layout={layouts.lg} onLayoutChange={handleLayoutChange}>
      {/* widgets */}
    </GridLayout>
  </>
)
```

## Frequently Asked Questions

### Q: Will this break my existing dashboard?
**A:** No! NEXUS is backward compatible. It reads the same layout format and works with react-grid-layout.

### Q: Do I have to use constraints?
**A:** No! Constraints are optional. Without constraints, NEXUS works like enhanced grid layout.

### Q: Can I use NEXUS with other layout libraries?
**A:** Yes! NEXUS is framework-agnostic. Use `NexusAdapter` to convert between formats.

### Q: How do I debug constraint issues?
**A:** Use the `NexusVisualization` component or check `engine.getPressureHistory()`.

### Q: What if widgets still overlap?
**A:** That shouldn't happen, but if it does:
1. Check constraint definitions for conflicts
2. Increase constraint solver iterations
3. Adjust flex priorities (lower priority yields space)

### Q: Can I export/import layouts?
**A:** Yes! Use `engine.exportConstraints()` and `engine.importConstraints()`.

## Next Steps

1. **Choose your approach**: Drop-in, custom constraints, or pure NEXUS
2. **Pick a dashboard**: Start with one page to test
3. **Run the migration**: Follow phases 1-3
4. **Gather feedback**: Test with real users
5. **Refine constraints**: Adjust based on usage patterns
6. **Expand**: Migrate other dashboards

## Support & Resources

- **Demo**: http://localhost:3000/nexus
- **Docs**: `NEXUS.md` (comprehensive guide)
- **Quick Start**: `NEXUS_QUICKSTART.md` (code examples)
- **Implementation**: `src/lib/layout/nexus.ts` (source code)
- **React Hook**: `src/hooks/useNexusLayout.ts` (React integration)

---

**Ready to go?** Start with Phase 1 - visit `/nexus` and explore! 🚀
