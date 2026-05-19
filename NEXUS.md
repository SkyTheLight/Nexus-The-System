# NEXUS: Node-Based Elastic Expression of Unified Space

A revolutionary layout engine for widget-based web applications that replaces rigid coordinate storage with intelligent constraint-based positioning and pressure-driven widget negotiation.

## The Problem It Solves

Traditional layout approaches fail because they:

- **Store brittle coordinates** - "Widget at (100, 200)" is meaningless and hard to maintain
- **Break when widgets interact** - Moving one widget requires manually updating everything
- **Are not responsive** - Different screen sizes need different hardcoded breakpoints
- **Lack semantic meaning** - Coordinates don't express intentional relationships
- **Treat conflicts as failures** - Overlapping widgets break the layout entirely

## The NEXUS Solution

NEXUS flips the paradigm: instead of storing *where* widgets are, it stores *how they relate* to each other.

### Core Concepts

#### 1. **Relational Constraints** (Not Coordinates)

```typescript
// ❌ Traditional: Rigid coordinates
{ id: 'widget1', x: 100, y: 200, width: 300 }

// ✅ NEXUS: Semantic relationships
{
  id: 'widget1',
  constraints: [
    { type: 'adjacent-to', target: 'widget2', direction: 'right', spacing: 16 },
    { type: 'aligned-with', target: 'widget3', axis: 'horizontal' },
    { type: 'max-width', value: 500 }
  ]
}
```

Available constraint types:
- `adjacent-to` - Place next to another widget
- `aligned-with` - Align on the same axis
- `stacked` - Stack above or below
- `max-width` / `max-height` - Size boundaries
- `min-width` / `min-height` - Size boundaries
- `aspect-ratio` - Maintain aspect ratio

#### 2. **Flex Behavior** (Growth/Shrink Preferences)

Each widget has flex properties that determine how aggressively it grows or shrinks:

```typescript
{
  basis: 'auto',        // Size calculation method
  grow: 1.5,            // Growth aggressiveness (1.0 = normal)
  shrink: 0.8,          // Shrink resistance (1.0 = normal)
  priority: 10          // Resolution priority (1-10)
}
```

#### 3. **Pressure System** (Dynamic Propagation)

When a widget resizes, it generates a "pressure" signal:

```
User drags widget edge (grows 100px)
       ↓
Widget generates PressureSignal { outward: 100, intensity: 1.5 }
       ↓
Pressure propagates through constraint graph
       ↓
Affected widgets check their flex properties
       ↓
High-grow widgets move/expand, low-grow widgets stay put
       ↓
System finds equilibrium through constraint satisfaction
```

#### 4. **Constraint Solver** (Equilibrium Finding)

The solver uses iterative constraint satisfaction to find positions where:
- All constraints are satisfied (if possible)
- Pressure is balanced
- Widget displacement is minimized

## Usage

### Basic Setup

```typescript
import { NexusEngine, createNexusWidget } from '@/lib/layout/nexus'

// Create widgets with constraints
const widgets = [
  createNexusWidget('focus-timer', {
    flex: { basis: 'auto', grow: 1.5, shrink: 0.5, priority: 10 },
    bounds: { minWidth: 250, maxWidth: 400, minHeight: 200, maxHeight: 500 }
  }),
  createNexusWidget('focus-stats', {
    flex: { basis: 'auto', grow: 0.8, shrink: 1, priority: 5 },
    constraints: [
      { type: 'adjacent-to', target: 'focus-timer', direction: 'right', spacing: 16 }
    ]
  })
]

// Initialize engine
const engine = new NexusEngine(1200) // containerWidth = 1200px
engine.init(widgets)

// Get resolved layout
const layout = engine.getLayout()
// Map<'focus-timer', { x: 0, y: 0, width: 300, height: 200 }>
// Map<'focus-stats', { x: 316, y: 0, width: 250, height: 150 }>
```

### Handling User Interactions

#### Resize

```typescript
// When user resizes widget to 400px wide and 250px tall
engine.resizeWidget('focus-timer', 400, 250)

// Engine automatically:
// 1. Calculates pressure from size change
// 2. Propagates to dependent widgets
// 3. Solves new constraint satisfaction problem
// 4. Returns updated layout with all positions recalculated
```

#### Drag

```typescript
// When user drags widget to new position
engine.dragWidget('focus-timer', 100, 50, ['focus-stats', 'focus-heatmap'])

// Engine:
// 1. Detects proximity to nearby widgets
// 2. Updates constraints based on new relationships
// 3. Re-solves layout with new relationships
```

### React Integration

#### With `useNexusLayout` Hook

Drop-in replacement for `useGridLayout`:

```typescript
'use client'

import { useNexusLayout } from '@/hooks/useNexusLayout'
import GridLayout from 'react-grid-layout'

export function MyDashboard() {
  const {
    layouts,
    handleLayoutChange,
    nexusWidgets,
    pressureHistory
  } = useNexusLayout({
    page: 'main',
    defaultLayouts: MY_DEFAULT_LAYOUTS,
    useNexusPressure: true
  })

  return (
    <GridLayout
      layout={layouts.lg}
      onLayoutChange={handleLayoutChange}
      // ... other props
    >
      {/* Your widgets */}
    </GridLayout>
  )
}
```

#### With Adapter (Direct Control)

```typescript
import { NexusAdapter, NexusWidgetPresets } from '@/lib/layout/nexusAdapter'

const adapter = new NexusAdapter(1200)

// Initialize from RGL layout
adapter.initFromLayout(existingLayout)

// Or initialize from scratch
adapter.addWidget(
  NexusWidgetPresets.priority('focus-timer')
)

// Handle layout changes
adapter.handleLayoutChange(newRglLayout)

// Export for persistence
const constraints = adapter.exportConstraints()
localStorage.setItem('my-layout', JSON.stringify(constraints))

// Import for restoration
adapter.importConstraints(JSON.parse(localStorage.getItem('my-layout')))
```

### Widget Presets

Built-in widget presets for common patterns:

```typescript
import { NexusWidgetPresets } from '@/lib/layout/nexusAdapter'

// High-priority, resistant to shrinking
NexusWidgetPresets.priority('widget-id')

// Flexible, adapts to available space
NexusWidgetPresets.flexible('widget-id')

// Fixed size, doesn't change
NexusWidgetPresets.fixed('widget-id', 300, 200)

// Responsive, balances growth and shrink
NexusWidgetPresets.responsive('widget-id')
```

## Advanced: Direct Engine Usage

For complete control without React:

```typescript
import { NexusEngine, NexusGraph, PressureSystem } from '@/lib/layout/nexus'

// Build constraint graph manually
const graph = new NexusGraph()

graph.addWidget({
  id: 'widget1',
  flex: { basis: 'auto', grow: 1, shrink: 1, priority: 5 },
  bounds: { minWidth: 200, maxWidth: 500, minHeight: 150, maxHeight: 400 },
  constraints: [
    { type: 'adjacent-to', target: 'widget2', direction: 'right', spacing: 16 }
  ]
})

// Access pressure history for visualization
const pressureHistory = engine.getPressureHistory()

// Calculate custom pressure
const pressure = PressureSystem.calculateResizePressure(widget, {
  width: 50,
  height: 30
})

// Propagate and track affected widgets
const signals = PressureSystem.propagatePressure(graph, pressure, maxDepth = 3)
```

## Architecture

```
┌─────────────────────────────────────────────┐
│ Your React Components                       │
└─────────────────────────────────────────────┘
              ↑        ↓
┌─────────────────────────────────────────────┐
│ useNexusLayout Hook (React Integration)    │
└─────────────────────────────────────────────┘
              ↑        ↓
┌─────────────────────────────────────────────┐
│ NexusAdapter (RGL Bridge)                   │
├─────────────────────────────────────────────┤
│ • Converts RGL ↔ NEXUS formats              │
│ • Manages responsiveness                    │
│ • Handles persistence                       │
└─────────────────────────────────────────────┘
              ↑        ↓
┌─────────────────────────────────────────────┐
│ NexusEngine (Main Orchestrator)             │
├─────────────────────────────────────────────┤
│ • Manages widget graph                      │
│ • Coordinates solver and pressure system    │
│ • Tracks layout state                       │
└─────────────────────────────────────────────┘
         ↑            ↑            ↑
    ┌────┴──┐     ┌───┴───┐   ┌───┴───────┐
    │        │     │       │   │           │
┌───┴─┐  ┌──┴──┐ ┌┴──┐  ┌─┴───┴──┐  ┌──┐
│Nexus│  │Nexus│ │Pres│  │Constraint
│Graph│  │Widget│ │sure│  │Solver  │
└─────┘  └──────┘ └────┘  └────────┘
```

## Performance

NEXUS is designed for efficiency:

- **Constraint solving**: O(n log n) via topological sort + iterative refinement
- **Pressure propagation**: O(n) BFS with max depth limiting
- **Responsiveness**: Changes propagate in milliseconds
- **Memory**: Stores relationships (MB range), not pixel coordinates

## Persistence

Save and restore layouts by storing the constraint graph:

```typescript
// Save
const constraints = engine.exportConstraints()
localStorage.setItem('layout', JSON.stringify(constraints))

// Restore
const saved = JSON.parse(localStorage.getItem('layout'))
engine.importConstraints(saved)
```

Unlike coordinate-based storage, constraint storage is:
- **Version-proof**: Relationships don't change across screen sizes
- **Understandable**: You can read "adjacent-to" and understand the intention
- **Durable**: Works across device sizes without manual migration

## Debugging & Visualization

Use the `NexusVisualization` component for debugging:

```typescript
import { NexusVisualization } from '@/components/NexusVisualization'

<NexusVisualization
  containerWidth={1200}
  showPressure={true}      // Show pressure waves
  showConstraints={true}   // Show constraint lines
  onLayoutChange={(layout) => console.log(layout)}
/>
```

Access pressure history from engine:

```typescript
const pressureHistory = engine.getPressureHistory()
// Array of PressureSignal:
// { sourceId, outward, direction, intensity, timestamp }
```

## Demo

Visit `/nexus` to see an interactive demonstration of the engine in action.

## Examples

### Building a Focus Dashboard

```typescript
const focusWidgets = [
  createNexusWidget('focus-timer', {
    flex: { grow: 1.5, shrink: 0.5, priority: 10 },
    constraints: [
      { type: 'adjacent-to', target: 'focus-stats', direction: 'right', spacing: 16 }
    ]
  }),
  
  createNexusWidget('focus-stats', {
    flex: { grow: 0.8, shrink: 1, priority: 5 }
  }),
  
  createNexusWidget('focus-heatmap', {
    flex: { grow: 1, shrink: 0.8, priority: 5 },
    constraints: [
      { type: 'aligned-with', target: 'focus-timer', axis: 'horizontal' }
    ]
  })
]

const engine = new NexusEngine(1200)
engine.init(focusWidgets)
```

When the timer grows to 400px, the stats widget automatically shifts right. When the container shrinks to 800px, widgets intelligently renegotiate spacing based on their flex properties.

## Comparison: NEXUS vs Traditional Approaches

| Aspect | Traditional | NEXUS |
|--------|-------------|-------|
| **Storage** | Absolute coordinates | Relational constraints |
| **Resizing** | Manual recalc | Automatic pressure propagation |
| **Responsiveness** | Hardcoded breakpoints | Continuous constraint resolution |
| **Conflict handling** | Overlaps or breaks | Elastic negotiation |
| **Semantic meaning** | None (just numbers) | Clear relationships |
| **Persistence** | Fragile pixel values | Durable relationships |
| **Complexity** | O(n²) with interactions | O(n log n) with optimizations |

## Future Enhancements

Potential extensions to NEXUS:

- **Animation**: Interpolate between constraint states for smooth transitions
- **Undo/Redo**: Replay pressure history to reconstruct layout changes
- **Collision detection**: Advanced spatial indexing for large widget counts
- **Custom constraints**: User-defined constraint types via plugins
- **ML optimization**: Learn user preferences to predict constraint patterns
- **Collaborative layouts**: Sync constraints across users in real-time

## Contributing

Interested in improving NEXUS? Areas for contribution:

1. Performance optimization (currently using naive solver)
2. Advanced constraint types (e.g., `minimum-aspect-ratio`)
3. Animation layer integration
4. Testing and edge cases
5. Documentation and examples

---

**NEXUS**: Because layouts shouldn't be rigid. They should be *alive*. 🌿
