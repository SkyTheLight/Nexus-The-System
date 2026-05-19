/**
 * NEXUS Quick Start Guide
 * 
 * Get up and running with NEXUS in 5 minutes
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * STEP 1: See the Demo (No Code Required)
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * 1. Start your dev server
 * 2. Navigate to: http://localhost:3000/nexus
 * 3. Interact with widgets:
 *    - Left-drag to move
 *    - Right-drag to resize
 *    - Watch pressure waves propagate
 *    - See constraint relationships
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * STEP 2: Use with React (Recommended)
 * ═══════════════════════════════════════════════════════════════════════
 */

// Before: Using traditional useGridLayout
import { useGridLayout } from '@/hooks/useGridLayout'
import GridLayout from 'react-grid-layout'

export function OldDashboard() {
  const { layouts, handleLayoutChange } = useGridLayout({
    page: 'main',
    defaultLayouts: DEFAULT_LAYOUTS
  })

  return (
    <GridLayout
      layout={layouts.lg}
      onLayoutChange={handleLayoutChange}
      cols={12}
      rowHeight={80}
      width={1200}
    >
      {/* widgets */}
    </GridLayout>
  )
}

// After: Using NEXUS (Just change the import!)
import { useNexusLayout } from '@/hooks/useNexusLayout'

export function NewDashboard() {
  const { layouts, handleLayoutChange } = useNexusLayout({
    page: 'main',
    defaultLayouts: DEFAULT_LAYOUTS,
    useNexusPressure: true // Enable pressure-based constraints
  })

  return (
    <GridLayout
      layout={layouts.lg}
      onLayoutChange={handleLayoutChange}
      cols={12}
      rowHeight={80}
      width={1200}
    >
      {/* Same widgets, but with intelligent constraints! */}
    </GridLayout>
  )
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * STEP 3: Add Intelligent Constraints
 * ═══════════════════════════════════════════════════════════════════════
 */

import {
  NexusAdapter,
  createNexusWidget,
  NexusWidgetPresets
} from '@/lib/layout/nexusAdapter'

// Create a NEXUS adapter
const adapter = new NexusAdapter(1200) // container width

// Add widgets with intelligent relationships
adapter.addWidget(
  createNexusWidget('focus-timer', {
    flex: {
      basis: 'auto',
      grow: 1.5,      // Very aggressive about growing
      shrink: 0.5,    // Resistant to shrinking
      priority: 10    // High priority - keep this big
    },
    bounds: {
      minWidth: 250,
      maxWidth: 400,
      minHeight: 200,
      maxHeight: 500
    },
    constraints: [
      // "Keep stats widget to my right"
      {
        type: 'adjacent-to',
        target: 'focus-stats',
        direction: 'right',
        spacing: 16
      },
      // "Align with heatmap horizontally"
      {
        type: 'aligned-with',
        target: 'focus-heatmap',
        axis: 'horizontal'
      }
    ]
  })
)

adapter.addWidget(
  createNexusWidget('focus-stats', {
    flex: {
      basis: 'auto',
      grow: 0.8,      // Moderate growth
      shrink: 1,      // Normal shrink behavior
      priority: 5     // Lower priority
    },
    constraints: [
      {
        type: 'adjacent-to',
        target: 'focus-timer',
        direction: 'left',
        spacing: 16
      }
    ]
  })
)

/**
 * ═══════════════════════════════════════════════════════════════════════
 * STEP 4: Handle User Interactions
 * ═══════════════════════════════════════════════════════════════════════
 */

// Get current layout (as RGL format)
const rglLayout = adapter.getAsLayout()

// Handle when user drags widgets (from RGL)
adapter.handleLayoutChange(newRglLayout)

// Get the updated layout back
const resolvedLayout = adapter.getAsLayout()

/**
 * ═══════════════════════════════════════════════════════════════════════
 * STEP 5: Save/Restore Layouts
 * ═══════════════════════════════════════════════════════════════════════
 */

// Export constraints for persistence
const constraints = adapter.exportConstraints()
localStorage.setItem('my-dashboard-layout', JSON.stringify(constraints))

// Later: restore from storage
const saved = JSON.parse(localStorage.getItem('my-dashboard-layout'))
adapter.importConstraints(saved)

/**
 * ═══════════════════════════════════════════════════════════════════════
 * STEP 6: Use Presets for Common Patterns
 * ═══════════════════════════════════════════════════════════════════════
 */

import { NexusWidgetPresets } from '@/lib/layout/nexusAdapter'

// Priority widget: Important, resists shrinking
adapter.addWidget(NexusWidgetPresets.priority('important-widget'))

// Flexible widget: Adapts to available space
adapter.addWidget(NexusWidgetPresets.flexible('info-widget'))

// Fixed widget: Never changes size
adapter.addWidget(NexusWidgetPresets.fixed('banner', 300, 100))

// Responsive widget: Balanced growth and shrink
adapter.addWidget(NexusWidgetPresets.responsive('chart-widget'))

/**
 * ═══════════════════════════════════════════════════════════════════════
 * STEP 7: Visualize Pressure for Debugging
 * ═══════════════════════════════════════════════════════════════════════
 */

import { NexusVisualization } from '@/components/NexusVisualization'

// Add this component to your dashboard to see pressure visualization
<NexusVisualization
  containerWidth={1200}
  showPressure={true}
  showConstraints={true}
  onLayoutChange={(layout) => console.log('New layout:', layout)}
/>

/**
 * ═══════════════════════════════════════════════════════════════════════
 * CONSTRAINT TYPES - Quick Reference
 * ═══════════════════════════════════════════════════════════════════════
 */

// 1. Adjacent-to: Place widget next to another
{
  type: 'adjacent-to',
  target: 'other-widget',
  direction: 'right', // 'left' | 'right' | 'top' | 'bottom'
  spacing: 16         // pixels between widgets
}

// 2. Aligned-with: Align on same axis
{
  type: 'aligned-with',
  target: 'other-widget',
  axis: 'horizontal'  // 'horizontal' | 'vertical'
}

// 3. Stacked: Stack vertically
{
  type: 'stacked',
  target: 'other-widget',
  above: true         // true = above, false = below
}

// 4-5. Size bounds
{
  type: 'max-width',
  value: 500
}
{
  type: 'min-height',
  value: 150
}

// 6. Aspect ratio
{
  type: 'aspect-ratio',
  ratio: 16 / 9
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * FLEX BEHAVIOR - How Widgets Compete for Space
 * ═══════════════════════════════════════════════════════════════════════
 */

// Aggressive grower, reluctant to shrink (like a primary widget)
{
  basis: 'auto',
  grow: 2,      // Takes extra space quickly
  shrink: 0.3,  // Fights shrinking
  priority: 10  // Solved first
}

// Flexible, adaptable (like secondary info)
{
  basis: 'auto',
  grow: 0.5,    // Doesn't rush to expand
  shrink: 1.5,  // Shrinks readily
  priority: 3   // Solved later
}

// Fixed (never changes, like a header)
{
  basis: 'content',
  grow: 0,      // Never grows
  shrink: 0,    // Never shrinks
  priority: 1
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * What Happens When User Resizes a Widget
 * ═══════════════════════════════════════════════════════════════════════
 */

// 1. User grabs widget edge and drags → grows 100px wider

// 2. NEXUS calculates pressure:
//    { sourceId: 'widget1', outward: 100, intensity: 1.5, ... }

// 3. Pressure propagates through constraint graph to dependent widgets

// 4. Each affected widget checks its flex properties:
//    - Can I shrink? (check flex.shrink)
//    - Can I move? (check flex.priority)
//    - Should I? (check pressure intensity vs. flex.priority)

// 5. Constraint solver finds new positions that:
//    ✓ Satisfy all constraints
//    ✓ Balance pressure
//    ✓ Minimize widget movement

// 6. Layout updates smoothly - users see connected widgets adapt together!

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Debugging: Check Pressure History
 * ═══════════════════════════════════════════════════════════════════════
 */

const engine = adapter.getAdapter()?.engine
const pressureHistory = engine?.getPressureHistory()

console.log(pressureHistory)
// Array of:
// {
//   sourceId: 'widget1',
//   outward: 50,
//   direction: 'right',
//   intensity: 1.2,
//   timestamp: 1234567890
// }

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Persisting Constraints vs Coordinates
 * ═══════════════════════════════════════════════════════════════════════
 */

// ❌ Old way (brittle):
// localStorage['layout'] = '{"widget1": {"x": 100, "y": 200}}'
// Problem: Different screen sizes need different x/y values

// ✅ NEXUS way (durable):
// localStorage['layout'] = '{
//   "widget1": {
//     "constraints": [
//       {"type": "adjacent-to", "target": "widget2", ...}
//     ],
//     "flex": {...}
//   }
// }'
// Advantage: Works on any screen size - just re-solve!

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Common Patterns
 * ═══════════════════════════════════════════════════════════════════════
 */

// Pattern 1: Primary + Secondary sidebar
{
  primary: NexusWidgetPresets.priority('content'),
  sidebar: createNexusWidget('sidebar', {
    flex: { grow: 0.3, shrink: 1.5 },
    constraints: [
      { type: 'adjacent-to', target: 'content', direction: 'right', spacing: 16 }
    ]
  })
}

// Pattern 2: Centered dashboard with equal widgets
[
  createNexusWidget('left', {
    flex: { grow: 1, shrink: 1, priority: 5 }
  }),
  createNexusWidget('center', {
    flex: { grow: 1, shrink: 1, priority: 5 },
    constraints: [
      { type: 'adjacent-to', target: 'left', direction: 'right', spacing: 16 }
    ]
  }),
  createNexusWidget('right', {
    flex: { grow: 1, shrink: 1, priority: 5 },
    constraints: [
      { type: 'adjacent-to', target: 'center', direction: 'right', spacing: 16 }
    ]
  })
]

// Pattern 3: Stacked widgets
[
  createNexusWidget('header', { flex: NexusWidgetPresets.fixed('header', 400, 50) }),
  createNexusWidget('content', {
    constraints: [
      { type: 'stacked', target: 'header', above: false }
    ]
  })
]

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Next Steps
 * ═══════════════════════════════════════════════════════════════════════
 */

// 1. Visit http://localhost:3000/nexus to see demo
// 2. Replace useGridLayout with useNexusLayout in one dashboard
// 3. Test resizing/dragging - watch pressure propagate
// 4. Add specific constraints for your widgets
// 5. Fine-tune flex properties for desired behavior
// 6. Check pressure visualization for debugging

// Questions? See NEXUS.md for complete documentation!
