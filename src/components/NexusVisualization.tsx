/**
 * NexusVisualization Component
 * 
 * Interactive demo of the NEXUS layout engine showing:
 * - Widget positioning and resizing
 * - Pressure propagation visualization
 * - Constraint relationships
 * - Real-time reflow
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  NexusEngine,
  NexusWidget,
  PressureSystem,
  LayoutPosition
} from '@/lib/layout/nexus'
import { createNexusWidget, NexusWidgetPresets } from '@/lib/layout/nexusAdapter'

interface NexusVisualizationProps {
  containerWidth?: number
  onLayoutChange?: (layout: Map<string, LayoutPosition>) => void
  showPressure?: boolean
  showConstraints?: boolean
  persistenceKey?: string
}

export function NexusVisualization({
  containerWidth = 1200,
  onLayoutChange,
  showPressure = true,
  showConstraints = true,
  persistenceKey = 'nexus-viz-layout'
}: NexusVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [engine] = useState(() => new NexusEngine(containerWidth))
  const [widgets, setWidgets] = useState<Map<string, LayoutPosition>>(new Map())
  const [pressureViz, setPressureViz] = useState<Array<{
    x: number
    y: number
    radius: number
    intensity: number
    color: string
  }>>([])
const [draggingWidget, setDraggingWidget] = useState<string | null>(null)
  const [resizingWidget, setResizingWidget] = useState<string | null>(null)

  const saveLayout = useCallback((layout: Map<string, LayoutPosition>) => {
    try {
      const positions: Record<string, LayoutPosition> = {}
      layout.forEach((pos, id) => {
        positions[id] = pos
      })
      localStorage.setItem(persistenceKey, JSON.stringify(positions))
    } catch (e) {
      console.warn('Failed to save layout', e)
    }
  }, [persistenceKey])

  // Load saved layout from localStorage and apply to engine
  useEffect(() => {
    let savedLayout: Map<string, LayoutPosition> | null = null
    
    try {
      const saved = localStorage.getItem(persistenceKey)
      if (saved) {
        const positions = JSON.parse(saved)
        savedLayout = new Map<string, LayoutPosition>(Object.entries(positions))
      }
    } catch (e) {
      console.warn('Failed to load saved layout', e)
    }

    // Initialize with sample widgets
    const sampleWidgets: NexusWidget[] = [
      createNexusWidget('focus-timer', {
        flex: { basis: 'auto', grow: 1.5, shrink: 0.5, priority: 10 },
        bounds: { minWidth: 250, maxWidth: 400, minHeight: 200, maxHeight: 500 },
        constraints: [
          { type: 'aligned-with', target: 'focus-stats', axis: 'horizontal' },
          { type: 'adjacent-to', target: 'focus-stats', direction: 'right', spacing: 16 }
        ]
      }),
      createNexusWidget('focus-stats', {
        flex: { basis: 'auto', grow: 0.8, shrink: 1, priority: 5 },
        bounds: { minWidth: 200, maxWidth: 350, minHeight: 150, maxHeight: 400 },
        constraints: [
          { type: 'adjacent-to', target: 'focus-timer', direction: 'left', spacing: 16 }
        ]
      }),
      createNexusWidget('focus-heatmap', {
        flex: { basis: 'auto', grow: 1.2, shrink: 0.8, priority: 5 },
        bounds: { minWidth: 300, maxWidth: 600, minHeight: 250, maxHeight: 500 },
        constraints: [
          { type: 'aligned-with', target: 'focus-timer', axis: 'vertical' }
        ]
      })
    ]

    engine.init(sampleWidgets)
    
    // Apply saved layout to engine widgets' bounds and resolved layouts
    if (savedLayout && savedLayout.size > 0) {
      const graph = (engine as any).graph
      savedLayout.forEach((pos, id) => {
        const widget = graph.getWidget(id)
        if (widget) {
          graph.updateWidget(id, {
            bounds: {
              ...widget.bounds,
              minWidth: pos.width,
              maxWidth: pos.width,
              minHeight: pos.height,
              maxHeight: pos.height
            },
            resolvedLayout: pos
          })
        }
      })
      // Skip solver to preserve exact saved positions - use savedLayout directly
      setWidgets(savedLayout)
      onLayoutChange?.(savedLayout)
    } else {
      updateLayout()
    }
  }, [engine])

  const updateLayout = useCallback(() => {
    const layout = engine.getLayout()
    setWidgets(layout)
    saveLayout(layout)
    onLayoutChange?.(layout)

    if (showPressure) {
      const pressureHistory = engine.getPressureHistory()
      const viz = pressureHistory.slice(-5).map((signal, idx) => {
        const widget = engine.getResolvedWidgets().find(w => w.id === signal.sourceId)
        if (!widget?.resolvedLayout) return null

        return {
          x: widget.resolvedLayout.x + widget.resolvedLayout.width / 2,
          y: widget.resolvedLayout.y + widget.resolvedLayout.height / 2,
          radius: signal.outward * 0.1,
          intensity: signal.intensity,
          color: `rgba(100, 150, 255, ${1 - idx * 0.15})`
        }
      }).filter(Boolean) as any
      setPressureViz(viz)
    }
  }, [engine, showPressure, onLayoutChange, saveLayout])

  const handleWidgetMouseDown = (e: React.MouseEvent, widgetId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    const startY = e.clientY
    const startPos = widgets.get(widgetId)
    if (!startPos) return

    // Determine interaction type based on click position within widget
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    const edgeThreshold = 15

    const isNearRight = relX > rect.width - edgeThreshold
    const isNearBottom = relY > rect.height - edgeThreshold
    const isNearLeft = relX < edgeThreshold
    const isNearTop = relY < edgeThreshold

    const isResize = isNearRight || isNearBottom || isNearLeft || isNearTop
    const isDrag = !isResize

    let isMoving = false

    const handleMouseMove = (moveEvent: MouseEvent) => {
      isMoving = true
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      if (isDrag) {
        // Left mouse button - drag (direct position update)
        setDraggingWidget(widgetId)
        
        // Directly update the widget in the layout
        const newLayout = new Map(widgets)
        const currentWidget = newLayout.get(widgetId)
        if (currentWidget) {
          newLayout.set(widgetId, {
            ...currentWidget,
            x: Math.max(0, startPos.x + deltaX),
            y: Math.max(0, startPos.y + deltaY)
          })
          setWidgets(newLayout)
          saveLayout(newLayout)
        }
      } else if (isResize) {
        // Resize from any edge
        setResizingWidget(widgetId)
        
        const newLayout = new Map(widgets)
        const currentWidget = newLayout.get(widgetId)
        if (currentWidget) {
          let newX = currentWidget.x
          let newY = currentWidget.y
          let newWidth = currentWidget.width
          let newHeight = currentWidget.height

          // Resize from right edge
          if (isNearRight) {
            newWidth = Math.max(100, currentWidget.width + deltaX)
          }
          // Resize from bottom edge
          if (isNearBottom) {
            newHeight = Math.max(100, currentWidget.height + deltaY)
          }
          // Resize from left edge
          if (isNearLeft) {
            const deltaW = -deltaX
            if (currentWidget.width + deltaW >= 100) {
              newWidth = currentWidget.width + deltaW
              newX = currentWidget.x - deltaW
            }
          }
          // Resize from top edge
          if (isNearTop) {
            const deltaH = -deltaY
            if (currentWidget.height + deltaH >= 100) {
              newHeight = currentWidget.height + deltaH
              newY = currentWidget.y - deltaH
            }
          }

          newLayout.set(widgetId, {
            x: Math.max(0, newX),
            y: Math.max(0, newY),
            width: newWidth,
            height: newHeight
          })
          setWidgets(newLayout)
          saveLayout(newLayout)
        }
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setDraggingWidget(null)
      setResizingWidget(null)
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { once: true })
  }

  const renderWidget = (id: string, pos: LayoutPosition) => {
    const widget = engine.getResolvedWidgets().find(w => w.id === id)
    if (!widget) return null

    const isDragging = draggingWidget === id
    const isResizing = resizingWidget === id

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const relX = e.clientX - rect.left
      const relY = e.clientY - rect.top
      const threshold = 15

      const isNearRight = relX > rect.width - threshold
      const isNearBottom = relY > rect.height - threshold
      const isNearLeft = relX < threshold
      const isNearTop = relY < threshold

      let cursor = 'move'
      if (isNearRight && isNearBottom) cursor = 'se-resize'
      else if (isNearLeft && isNearTop) cursor = 'nw-resize'
      else if (isNearRight && isNearTop) cursor = 'ne-resize'
      else if (isNearLeft && isNearBottom) cursor = 'sw-resize'
      else if (isNearRight || isNearLeft) cursor = 'ew-resize'
      else if (isNearTop || isNearBottom) cursor = 'ns-resize'

      ;(e.currentTarget as HTMLElement).style.cursor = cursor
    }

    return (
      <div
        key={id}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => handleWidgetMouseDown(e, id)}
        onMouseMove={handleMouseMove}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.cursor = 'move'
        }}
        className={`absolute bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 transition-all ${
          isDragging ? 'opacity-80 shadow-2xl' : isResizing ? 'opacity-70 shadow-xl' : 'shadow-lg'
        }`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${pos.width}px`,
          height: `${pos.height}px`,
          userSelect: 'none',
          pointerEvents: 'auto',
          border: showConstraints ? '2px solid rgba(255,255,255,0.3)' : 'none',
          touchAction: 'none'
        }}
      >
        <div className='text-white text-sm font-semibold truncate'>{id}</div>
        <div className='text-white text-xs opacity-75 mt-1'>
          {Math.round(pos.width)}×{Math.round(pos.height)}
        </div>
        <div className='text-white text-xs opacity-60 mt-2'>
          Flex: {widget.flex.grow.toFixed(1)}
        </div>
        {showConstraints && widget.constraints.length > 0 && (
          <div className='text-white text-xs opacity-50 mt-2 border-t border-white border-opacity-20 pt-2'>
            {widget.constraints.map((c, i) => (
              <div key={i}>
                {c.type === 'adjacent-to' && `→ ${c.target}`}
                {c.type === 'aligned-with' && `║ ${c.target}`}
              </div>
            ))}
          </div>
        )}
        <div className='absolute bottom-2 right-2 text-white text-xs opacity-40'>
          Drag edge to resize
        </div>
      </div>
    )
  }

  const renderPressure = () => {
    if (!showPressure) return null

    return (
      <svg
        className='absolute inset-0 pointer-events-none'
        width={containerWidth}
        height={widgets.size > 0 ? Math.max(...Array.from(widgets.values()).map(w => w.y + w.height)) : 500}
        style={{ mixBlendMode: 'screen' }}
      >
        {pressureViz.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.radius}
              fill={p.color}
              opacity={p.intensity * 0.3}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={p.radius}
              fill='none'
              stroke={p.color}
              strokeWidth='2'
              opacity={p.intensity * 0.5}
            />
          </g>
        ))}
      </svg>
    )
  }

  const renderConstraintLines = () => {
    if (!showConstraints) return null

    const lines = []
    for (const widget of engine.getResolvedWidgets()) {
      for (const constraint of widget.constraints) {
        if (constraint.type === 'adjacent-to' || constraint.type === 'aligned-with') {
          const source = widgets.get(widget.id)
          const target = widgets.get(constraint.target)
          if (!source || !target) continue

          const x1 = source.x + source.width / 2
          const y1 = source.y + source.height / 2
          const x2 = target.x + target.width / 2
          const y2 = target.y + target.height / 2

          lines.push(
            <line
              key={`${widget.id}-${constraint.target}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke='rgba(100,200,255,0.2)'
              strokeWidth='1'
              strokeDasharray='4,4'
            />
          )
        }
      }
    }

    return (
      <svg
        className='absolute inset-0 pointer-events-none'
        width={containerWidth}
        height={widgets.size > 0 ? Math.max(...Array.from(widgets.values()).map(w => w.y + w.height)) : 500}
      >
        {lines}
      </svg>
    )
  }

  const totalHeight = widgets.size > 0 
    ? Math.max(...Array.from(widgets.values()).map(w => w.y + w.height)) + 50
    : 600

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between bg-slate-900 p-4 rounded-lg'>
        <div>
          <h3 className='text-white font-bold'>NEXUS Layout Visualization</h3>
          <p className='text-gray-400 text-sm'>
            Drag anywhere to move • Drag edges to resize
          </p>
        </div>
        <div className='flex gap-2 text-xs text-gray-400'>
          <label className='flex items-center gap-1'>
            <input
              type='checkbox'
              checked={showPressure}
              disabled
              className='cursor-pointer'
            />
            Pressure waves
          </label>
          <label className='flex items-center gap-1'>
            <input
              type='checkbox'
              checked={showConstraints}
              disabled
              className='cursor-pointer'
            />
            Constraint lines
          </label>
        </div>
      </div>

      <div
        ref={containerRef}
        className='relative bg-slate-950 rounded-lg border border-slate-800'
        style={{ 
          height: `${totalHeight}px`,
          overflow: 'hidden',
          pointerEvents: 'auto'
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {renderConstraintLines()}
        {renderPressure()}
        
        {/* Grid background */}
        <svg
          className='absolute inset-0 pointer-events-none'
          width={containerWidth}
          height={totalHeight}
          style={{ opacity: 0.05 }}
        >
          <defs>
            <pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>
              <path d='M 40 0 L 0 0 0 40' fill='none' stroke='white' strokeWidth='0.5' />
            </pattern>
          </defs>
          <rect width={containerWidth} height={totalHeight} fill='url(#grid)' />
        </svg>
        
        {Array.from(widgets.entries()).map(([id, pos]) => renderWidget(id, pos))}
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-2 text-xs text-gray-400 bg-slate-900 p-3 rounded-lg'>
        <div>
          <span className='text-gray-300 font-semibold'>{widgets.size}</span> widgets
        </div>
        <div>
          <span className='text-gray-300 font-semibold'>{pressureViz.length}</span> active pressures
        </div>
        <div>
          <span className='text-gray-300 font-semibold'>
            {engine.getResolvedWidgets().reduce((sum, w) => sum + w.constraints.length, 0)}
          </span> constraints
        </div>
      </div>

      {/* Legend */}
      <div className='text-xs text-gray-400 bg-slate-900 p-3 rounded-lg space-y-1'>
        <p className='text-gray-300 font-semibold mb-2'>How NEXUS Works:</p>
        <p>1. Widgets store <span className='text-blue-400'>relational constraints</span>, not coordinates</p>
        <p>2. When resized, widgets generate <span className='text-cyan-400'>pressure signals</span></p>
        <p>3. Pressure <span className='text-purple-400'>propagates</span> through the constraint graph</p>
        <p>4. Affected widgets <span className='text-green-400'>renegotiate</span> their positions</p>
        <p>5. System finds <span className='text-yellow-400'>equilibrium</span> in milliseconds</p>
      </div>
    </div>
  )
}

export default NexusVisualization
