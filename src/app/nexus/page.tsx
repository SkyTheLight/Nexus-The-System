/**
 * NEXUS Layout Engine - Interactive Demo
 * 
 * Live demonstration of the revolutionary constraint-based layout system
 * showing real-time pressure propagation and elastic widget negotiation.
 */

'use client'

import React from 'react'
import BackButton from '@/components/BackButton'
import { NexusVisualization } from '@/components/NexusVisualization'

export default function NexusDemo() {
  const [widthIdx, setWidthIdx] = React.useState(2)
  
  const widths = [800, 1000, 1200, 1400, 1600]
  const width = widths[widthIdx]

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8'>
      <BackButton />
      
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* Header */}
        <div className='space-y-4'>
          <h1 className='text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'>
            NEXUS Layout Engine
          </h1>
          <p className='text-gray-400 text-lg max-w-2xl'>
            A revolutionary constraint-based layout system that replaces rigid coordinate storage 
            with intelligent widget negotiation through pressure signals and elastic constraints.
          </p>
        </div>

        {/* Key Features */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-slate-800/50 border border-blue-500/20 rounded-lg p-4'>
            <div className='text-blue-400 font-bold mb-2'>⚡ Pressure-Based</div>
            <p className='text-sm text-gray-400'>
              Widgets generate pressure signals that intelligently propagate through the constraint graph
            </p>
          </div>
          <div className='bg-slate-800/50 border border-purple-500/20 rounded-lg p-4'>
            <div className='text-purple-400 font-bold mb-2'>🔗 Relational</div>
            <p className='text-sm text-gray-400'>
              Store relationships between widgets, not absolute coordinates
            </p>
          </div>
          <div className='bg-slate-800/50 border border-pink-500/20 rounded-lg p-4'>
            <div className='text-pink-400 font-bold mb-2'>✨ Elastic</div>
            <p className='text-sm text-gray-400'>
              Widgets automatically adapt through constraint satisfaction and flex negotiation
            </p>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-white'>Interactive Demonstration</h2>
            <div className='flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg'>
              <span className='text-sm text-gray-400'>Container Width:</span>
              <input
                type='range'
                min='0'
                max={widths.length - 1}
                value={widthIdx}
                onChange={(e) => setWidthIdx(parseInt(e.target.value))}
                className='w-32'
              />
              <span className='text-sm font-semibold text-blue-400 min-w-fit'>{width}px</span>
            </div>
          </div>
          
          <NexusVisualization
            containerWidth={width}
            showPressure={true}
            showConstraints={true}
          />
        </div>

        {/* How It Works */}
        <div className='bg-slate-800/30 border border-slate-700 rounded-lg p-6 space-y-4'>
          <h3 className='text-xl font-bold text-white'>How NEXUS Works</h3>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm flex-shrink-0'>1</div>
                <div>
                  <p className='font-semibold text-white'>Constraint Graph</p>
                  <p className='text-sm text-gray-400'>
                    Instead of storing widget coordinates, NEXUS stores relational constraints like "adjacent-to", "aligned-with", and "stacked"
                  </p>
                </div>
              </div>

              <div className='flex gap-3'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-sm flex-shrink-0'>2</div>
                <div>
                  <p className='font-semibold text-white'>Pressure Signals</p>
                  <p className='text-sm text-gray-400'>
                    When a widget resizes, it generates a "pressure" signal that propagates through affected widgets
                  </p>
                </div>
              </div>

              <div className='flex gap-3'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 font-bold text-sm flex-shrink-0'>3</div>
                <div>
                  <p className='font-semibold text-white'>Negotiation</p>
                  <p className='text-sm text-gray-400'>
                    Affected widgets check their flex properties (grow/shrink values) and decide how to adapt
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex gap-3'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm flex-shrink-0'>4</div>
                <div>
                  <p className='font-semibold text-white'>Constraint Solver</p>
                  <p className='text-sm text-gray-400'>
                    Solves the constraint satisfaction problem to find positions that honor all relationships
                  </p>
                </div>
              </div>

              <div className='flex gap-3'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold text-sm flex-shrink-0'>5</div>
                <div>
                  <p className='font-semibold text-white'>Equilibrium</p>
                  <p className='text-sm text-gray-400'>
                    The system converges to a layout where all constraints are satisfied and pressure is balanced
                  </p>
                </div>
              </div>

              <div className='flex gap-3'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold text-sm flex-shrink-0'>6</div>
                <div>
                  <p className='font-semibold text-white'>Responsive Reflow</p>
                  <p className='text-sm text-gray-400'>
                    When container resizes, the constraint graph is re-solved—no hardcoded breakpoints needed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advantages */}
        <div className='space-y-4'>
          <h3 className='text-xl font-bold text-white'>Why NEXUS is Better</h3>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg p-4'>
              <p className='text-sm font-semibold text-green-400 mb-2'>✓ No Brittle Coordinates</p>
              <p className='text-sm text-gray-300'>
                Positions are derived from constraints, not stored as fragile absolute values
              </p>
            </div>

            <div className='bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-lg p-4'>
              <p className='text-sm font-semibold text-blue-400 mb-2'>✓ Intelligent Adaptation</p>
              <p className='text-sm text-gray-300'>
                Widgets adapt based on flex properties and constraint satisfaction, not rigid grid cells
              </p>
            </div>

            <div className='bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-lg p-4'>
              <p className='text-sm font-semibold text-purple-400 mb-2'>✓ True Responsiveness</p>
              <p className='text-sm text-gray-300'>
                Scales to any container size through constraint re-solving, no breakpoint hell
              </p>
            </div>

            <div className='bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border border-orange-500/20 rounded-lg p-4'>
              <p className='text-sm font-semibold text-orange-400 mb-2'>✓ Semantic Meaning</p>
              <p className='text-sm text-gray-300'>
                Relationships like "aligned-with" and "adjacent-to" are self-documenting and understandable
              </p>
            </div>

            <div className='bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/20 rounded-lg p-4'>
              <p className='text-sm font-semibold text-indigo-400 mb-2'>✓ Persistent State</p>
              <p className='text-sm text-gray-300'>
                Save and restore layouts by storing constraints, not fragile pixel coordinates
              </p>
            </div>

            <div className='bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/20 rounded-lg p-4'>
              <p className='text-sm font-semibold text-rose-400 mb-2'>✓ Collision Handling</p>
              <p className='text-sm text-gray-300'>
                Conflicts are resolved through negotiation and constraint relaxation, not overlaps
              </p>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className='bg-slate-800/30 border border-slate-700 rounded-lg p-6 space-y-3'>
          <h3 className='text-xl font-bold text-white'>Usage Example</h3>
          <pre className='bg-slate-950 rounded p-4 overflow-x-auto text-xs text-gray-300'>
{`import { NexusEngine, createNexusWidget } from '@/lib/layout/nexus'

// Create widgets with constraints
const widgets = [
  createNexusWidget('timer', {
    flex: { basis: 'auto', grow: 1.5, shrink: 0.5, priority: 10 },
    constraints: [
      { type: 'adjacent-to', target: 'stats', direction: 'right', spacing: 16 }
    ]
  }),
  createNexusWidget('stats', {
    flex: { basis: 'auto', grow: 0.8, shrink: 1, priority: 5 }
  })
]

// Initialize engine
const engine = new NexusEngine(1200)
engine.init(widgets)

// When user resizes timer:
engine.resizeWidget('timer', 400, 250)

// Engine automatically:
// 1. Calculates pressure
// 2. Propagates to affected widgets
// 3. Solves constraints
// 4. Returns new equilibrium layout`}
          </pre>
        </div>

        {/* Integration */}
        <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 space-y-3'>
          <h3 className='text-lg font-bold text-blue-300'>🚀 Ready to Use</h3>
          <p className='text-sm text-gray-300'>
            NEXUS is fully integrated into your Adversity app. You can use it in two ways:
          </p>
          <ul className='text-sm text-gray-400 space-y-2 ml-4'>
            <li>✓ <code className='bg-slate-900 px-2 py-1 rounded text-blue-300'>useNexusLayout</code> - Drop-in replacement for useGridLayout</li>
            <li>✓ <code className='bg-slate-900 px-2 py-1 rounded text-blue-300'>NexusVisualization</code> - Component for debugging and demo</li>
            <li>✓ Direct engine access via adapter for complete control</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
