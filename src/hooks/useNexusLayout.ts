/**
 * useNexusLayout - React hook for NEXUS-powered layouts
 *
 * Drop-in alternative to useGridLayout that uses the NEXUS engine
 * while maintaining compatibility with react-grid-layout.
 */

'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { Layout, Layouts } from 'react-grid-layout'
import {
  loadConstraints,
  saveConstraints,
  type LayoutPage,
  type WidgetConstraint
} from '@/lib/layout'
import { NexusAdapter, layoutToNexusWidgets, NexusWidgetPresets } from '@/lib/layout/nexusAdapter'
import type { NexusWidget } from '@/lib/layout/nexus'

interface UseNexusLayoutOptions {
  page: LayoutPage
  defaultLayouts: Layouts
  widgetIds?: string[]
  containerWidth?: number
  useNexusPressure?: boolean // Enable pressure-based auto-adjustment
}

export function useNexusLayout({
  page,
  defaultLayouts,
  widgetIds = [],
  containerWidth: initialWidth = 1200,
  useNexusPressure = true
}: UseNexusLayoutOptions) {
  // Initialize adapter
  const adapterRef = useRef<NexusAdapter | null>(null)
  
  const [containerWidth, setContainerWidth] = useState(initialWidth)
  const [layouts, setLayouts] = useState<Layouts>({})
  const [loaded, setLoaded] = useState(false)
  const [switchMode, setSwitchMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [gridOverlay, setGridOverlay] = useState(false)
  
  // NEXUS-specific state
  const [nexusWidgets, setNexusWidgets] = useState<NexusWidget[]>([])
  const [pressureHistory, setPressureHistory] = useState<any[]>([])

  const savingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize adapter on first render
  useEffect(() => {
    if (!adapterRef.current) {
      const adapter = new NexusAdapter(containerWidth)
      
      // Load existing constraints or start fresh
      const defaultConstraints = layoutToNexusWidgets(defaultLayouts.lg ?? [])
      adapter.initFromNexus(defaultConstraints)
      
      adapterRef.current = adapter
      updateLayout()
    }
  }, [])

  // Helper to update state from adapter
  const updateLayout = useCallback(() => {
    if (!adapterRef.current) return
    
    const newLayout = adapterRef.current.getAsLayout()
    setLayouts({
      lg: newLayout,
      md: newLayout,
      sm: newLayout,
      xs: newLayout
    })
    
    const widgets = adapterRef.current.getAsNexus()
    setNexusWidgets(widgets)
    
    if (useNexusPressure) {
      setPressureHistory(adapterRef.current.getPressureHistory())
    }
  }, [useNexusPressure])

  // Persist constraints when they change
  const persistConstraints = useCallback((widgets: NexusWidget[]) => {
    if (!adapterRef.current) return
    
    const constraints = adapterRef.current.exportConstraints()
    
    try {
      localStorage.setItem(
        `nexus-${page}-constraints-v1`,
        JSON.stringify(constraints)
      )
    } catch (e) {
      console.warn('Failed to persist NEXUS constraints', e)
    }

    if (savingRef.current) clearTimeout(savingRef.current)
    savingRef.current = setTimeout(() => {
      // Could sync to backend here
    }, 500)
  }, [page])

  // Update container width for responsive design
  useEffect(() => {
    if (adapterRef.current) {
      adapterRef.current.setContainerWidth(containerWidth)
      updateLayout()
    }
  }, [containerWidth, updateLayout])

  // Handle RGL layout changes
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      if (!loaded || !adapterRef.current) return

      adapterRef.current.handleLayoutChange(newLayout)
      updateLayout()
      
      const widgets = adapterRef.current.getAsNexus()
      persistConstraints(widgets)
    },
    [loaded, updateLayout, persistConstraints]
  )

  // Handle widget resize with pressure-based constraints
  const handleWidgetResize = useCallback(
    (id: string, width: number, height: number) => {
      if (!adapterRef.current) return
      
      adapterRef.current.engine.resizeWidget(id, width, height)
      updateLayout()
      
      const widgets = adapterRef.current.getAsNexus()
      persistConstraints(widgets)
    },
    [updateLayout, persistConstraints]
  )

  // Handle widget drag with proximity detection
  const handleWidgetDrag = useCallback(
    (id: string, x: number, y: number) => {
      if (!adapterRef.current) return
      
      const layout = adapterRef.current.getAsLayout()
      const nearbyIds = layout
        .filter(item => item.i !== id)
        .filter(item => {
          // Simple proximity check
          const widget = layout.find(w => w.i === id)
          if (!widget) return false
          return Math.abs(item.y - widget.y) <= 2 || Math.abs(item.x - widget.x) <= 2
        })
        .map(item => item.i)

      adapterRef.current.engine.dragWidget(id, x, y, nearbyIds)
      updateLayout()
      
      const widgets = adapterRef.current.getAsNexus()
      persistConstraints(widgets)
    },
    [updateLayout, persistConstraints]
  )

  // Widget swap in switch mode
  const handleWidgetClick = useCallback((id: string) => {
    if (!switchMode) return

    if (selectedId === null) {
      setSelectedId(id)
    } else if (selectedId === id) {
      setSelectedId(null)
    } else if (adapterRef.current) {
      // Swap via constraint reordering
      const widgets = adapterRef.current.getAsNexus()
      const a = widgets.find(w => w.id === selectedId)
      const b = widgets.find(w => w.id === id)
      
      if (a && b) {
        // For now, we'd need to implement constraint-based swapping
        // This is more complex with NEXUS since positions are derived
        setSelectedId(null)
      }
    }
  }, [switchMode, selectedId])

  // Add widget with NEXUS constraints
  const addWidget = useCallback(
    (id: string, preset: 'priority' | 'flexible' | 'fixed' | 'responsive' = 'responsive') => {
      if (!adapterRef.current) return

      const widget =
        preset === 'priority'
          ? NexusWidgetPresets.priority(id)
          : preset === 'flexible'
          ? NexusWidgetPresets.flexible(id)
          : preset === 'responsive'
          ? NexusWidgetPresets.responsive(id)
          : NexusWidgetPresets.responsive(id)

      adapterRef.current.addWidget(widget)
      updateLayout()
      
      const widgets = adapterRef.current.getAsNexus()
      persistConstraints(widgets)
    },
    [updateLayout, persistConstraints]
  )

  // Remove widget
  const removeWidget = useCallback(
    (id: string) => {
      if (!adapterRef.current) return
      
      adapterRef.current.removeWidget(id)
      updateLayout()
      
      const widgets = adapterRef.current.getAsNexus()
      persistConstraints(widgets)
    },
    [updateLayout, persistConstraints]
  )

  // Cleanup
  useEffect(() => {
    const flush = () => {
      if (adapterRef.current) {
        const constraints = adapterRef.current.exportConstraints()
        try {
          localStorage.setItem(
            `nexus-${page}-constraints-v1`,
            JSON.stringify(constraints)
          )
        } catch (e) {
          console.warn('Failed to persist NEXUS constraints on unload', e)
        }
      }
    }

    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      if (savingRef.current) clearTimeout(savingRef.current)
    }
  }, [page])

  // Mark as loaded after initialization
  useEffect(() => {
    setLoaded(true)
  }, [])

  return {
    // RGL compatibility
    layouts,
    loaded,
    switchMode,
    setSwitchMode,
    selectedId,
    setSelectedId,
    gridOverlay,
    setGridOverlay,
    containerWidth,
    setContainerWidth,
    handleLayoutChange,
    handleWidgetClick,

    // NEXUS-specific
    nexusWidgets,
    pressureHistory,
    handleWidgetResize,
    handleWidgetDrag,
    addWidget,
    removeWidget,
    
    // Direct engine access
    getAdapter: () => adapterRef.current
  }
}

/**
 * Simpler hook for NEXUS-only layouts (no RGL wrapper)
 */
export function useNexusLayoutDirect({
  page,
  containerWidth: initialWidth = 1200,
  onLayoutChange
}: {
  page: LayoutPage
  containerWidth?: number
  onLayoutChange?: (layout: any) => void
}) {
  const [containerWidth, setContainerWidth] = useState(initialWidth)
  const [nexusWidgets, setNexusWidgets] = useState<NexusWidget[]>([])
  
  const adapterRef = useRef<NexusAdapter | null>(null)

  useEffect(() => {
    if (!adapterRef.current) {
      const adapter = new NexusAdapter(containerWidth)
      adapterRef.current = adapter
    }
  }, [containerWidth])

  const updateLayout = useCallback(() => {
    if (!adapterRef.current) return
    
    const widgets = adapterRef.current.getAsNexus()
    setNexusWidgets(widgets)
    
    onLayoutChange?.(widgets)
  }, [onLayoutChange])

  return {
    nexusWidgets,
    containerWidth,
    setContainerWidth,
    addWidget: (widget: NexusWidget) => {
      adapterRef.current?.addWidget(widget)
      updateLayout()
    },
    removeWidget: (id: string) => {
      adapterRef.current?.removeWidget(id)
      updateLayout()
    },
    getAdapter: () => adapterRef.current
  }
}
