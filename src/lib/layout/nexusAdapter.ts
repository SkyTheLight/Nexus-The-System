/**
 * NEXUS-to-RGL Adapter
 * 
 * Bridges the NEXUS engine with react-grid-layout (RGL),
 * allowing seamless integration with existing dashboard code.
 */

import type { Layout, Layouts } from 'react-grid-layout'
import {
  NexusEngine,
  NexusWidget,
  NexusGraph,
  FlexBehavior,
  SizeBounds,
  RelationalConstraint,
  LayoutSolution,
  LayoutPosition
} from './nexus'

/**
 * Convert RGL Layout to NEXUS widgets
 * Use this to migrate existing layouts to NEXUS
 */
export function layoutToNexusWidgets(
  layout: Layout,
  options?: {
    flexBehavior?: Partial<FlexBehavior>
    defaultBounds?: Partial<SizeBounds>
  }
): NexusWidget[] {
  const defaultFlex: FlexBehavior = {
    basis: 'auto',
    grow: 1,
    shrink: 1,
    priority: 5,
    ...options?.flexBehavior
  }

  const defaultBounds: SizeBounds = {
    minWidth: 1,
    maxWidth: 12,
    minHeight: 2,
    maxHeight: 12,
    ...options?.defaultBounds
  }

  return layout.map(item => ({
    id: item.i,
    flex: defaultFlex,
    bounds: {
      ...defaultBounds,
      minWidth: item.minW ?? 1,
      maxWidth: item.maxW ?? 12,
      minHeight: item.minH ?? 2,
      maxHeight: item.maxH ?? 12
    },
    constraints: []
  }))
}

/**
 * Convert NEXUS layout solution to RGL Layout
 * Takes resolved positions from NEXUS and converts to grid units
 */
export function nexusLayoutToRGL(
  solution: LayoutSolution,
  containerWidth: number,
  gridCols: number = 12,
  rowHeight: number = 80,
  gridGap: number = 12
): Layout {
  const colWidth = (containerWidth - gridGap * (gridCols - 1)) / gridCols

  return Array.from(solution.entries()).map(([id, pos]) => {
    // Convert pixels to grid units
    const x = Math.round(pos.x / (colWidth + gridGap))
    const y = Math.round(pos.y / (rowHeight + gridGap))
    const w = Math.max(1, Math.round(pos.width / (colWidth + gridGap)))
    const h = Math.max(1, Math.round(pos.height / (rowHeight + gridGap)))

    return {
      i: id,
      x: Math.max(0, Math.min(x, gridCols - w)),
      y,
      w: Math.min(w, gridCols),
      h,
      static: false
    }
  })
}

/**
 * Convert RGL position to pixels
 */
export function rglToPxPosition(
  rglItem: { x: number; y: number; w: number; h: number },
  containerWidth: number,
  gridCols: number = 12,
  rowHeight: number = 80,
  gridGap: number = 12
): LayoutPosition {
  const colWidth = (containerWidth - gridGap * (gridCols - 1)) / gridCols
  
  return {
    x: rglItem.x * (colWidth + gridGap),
    y: rglItem.y * (rowHeight + gridGap),
    width: rglItem.w * colWidth + (rglItem.w - 1) * gridGap,
    height: rglItem.h * rowHeight + (rglItem.h - 1) * gridGap
  }
}

/**
 * NEXUS Adapter for seamless integration
 */
export class NexusAdapter {
  private engine: NexusEngine
  private containerWidth: number
  private gridCols: number
  private rowHeight: number
  private gridGap: number

  constructor(
    containerWidth: number = 1200,
    gridCols: number = 12,
    rowHeight: number = 80,
    gridGap: number = 12
  ) {
    this.containerWidth = containerWidth
    this.gridCols = gridCols
    this.rowHeight = rowHeight
    this.gridGap = gridGap
    this.engine = new NexusEngine(containerWidth)
  }

  /**
   * Initialize from RGL layout
   */
  initFromLayout(layout: Layout): void {
    const nexusWidgets = layoutToNexusWidgets(layout)
    this.engine.init(nexusWidgets)
  }

  /**
   * Initialize from NEXUS widgets
   */
  initFromNexus(widgets: NexusWidget[]): void {
    this.engine.init(widgets)
  }

  /**
   * Get current layout as RGL format
   */
  getAsLayout(): Layout {
    const solution = this.engine.getLayout()
    return nexusLayoutToRGL(
      solution,
      this.containerWidth,
      this.gridCols,
      this.rowHeight,
      this.gridGap
    )
  }

  /**
   * Get current layout as NEXUS widgets
   */
  getAsNexus(): NexusWidget[] {
    return this.engine.getResolvedWidgets()
  }

  /**
   * Update container width and reflow
   */
  setContainerWidth(width: number): void {
    this.containerWidth = width
    this.engine.setContainerWidth(width)
  }

  /**
   * Handle RGL layout change
   */
  handleLayoutChange(newLayout: Layout): void {
    // Get the last modified widget (basic heuristic: latest widget)
    // In production, RGL provides modification info
    for (const item of newLayout) {
      const widget = this.engine.getResolvedWidgets().find(w => w.id === item.i)
      if (widget?.resolvedLayout) {
        const oldPos = widget.resolvedLayout
        const newPos = rglToPxPosition(
          item,
          this.containerWidth,
          this.gridCols,
          this.rowHeight,
          this.gridGap
        )

        // Detect if it was a resize or drag
        if (
          newPos.width !== oldPos.width ||
          newPos.height !== oldPos.height
        ) {
          this.engine.resizeWidget(item.i, newPos.width, newPos.height)
        } else if (
          newPos.x !== oldPos.x ||
          newPos.y !== oldPos.y
        ) {
          // Drag detected - find nearby widgets
          const nearby = this.findNearbyWidgets(item.i, newLayout)
          this.engine.dragWidget(item.i, newPos.x, newPos.y, nearby)
        }
      }
    }
  }

  /**
   * Find nearby widget IDs (for proximity-based constraints)
   */
  private findNearbyWidgets(widgetId: string, layout: Layout): string[] {
    const widget = layout.find(w => w.i === widgetId)
    if (!widget) return []

    const nearby: string[] = []
    const proximity = 2 // grid units

    for (const other of layout) {
      if (other.i === widgetId) continue

      // Check if horizontally close
      if (
        Math.abs(other.x - widget.x) <= proximity ||
        Math.abs(other.x + other.w - widget.x) <= proximity
      ) {
        nearby.push(other.i)
      }

      // Check if vertically close
      if (
        Math.abs(other.y - widget.y) <= proximity ||
        Math.abs(other.y + other.h - widget.y) <= proximity
      ) {
        nearby.push(other.i)
      }
    }

    return nearby
  }

  /**
   * Export constraints for persistence
   */
  exportConstraints() {
    return this.engine.exportConstraints()
  }

  /**
   * Import constraints for restoration
   */
  importConstraints(data: any[]): void {
    this.engine.importConstraints(data)
  }

  /**
   * Get pressure history
   */
  getPressureHistory() {
    return this.engine.getPressureHistory()
  }

  /**
   * Add widget with specific constraints
   */
  addWidget(widget: NexusWidget): void {
    this.engine.addWidget(widget)
  }

  /**
   * Remove widget
   */
  removeWidget(id: string): void {
    this.engine.removeWidget(id)
  }
}

/**
 * Helper to create a NEXUS widget from common patterns
 */
export function createNexusWidget(
  id: string,
  options?: {
    flex?: Partial<FlexBehavior>
    bounds?: Partial<SizeBounds>
    constraints?: RelationalConstraint[]
  }
): NexusWidget {
  const defaultFlex: FlexBehavior = {
    basis: 'auto',
    grow: 1,
    shrink: 1,
    priority: 5
  }

  const defaultBounds: SizeBounds = {
    minWidth: 200,
    maxWidth: 500,
    minHeight: 150,
    maxHeight: 600
  }

  return {
    id,
    flex: { ...defaultFlex, ...options?.flex },
    bounds: { ...defaultBounds, ...options?.bounds },
    constraints: options?.constraints ?? []
  }
}

/**
 * Create preset NEXUS widgets for dashboard
 */
export const NexusWidgetPresets = {
  /**
   * Tight, high-priority widget
   */
  priority: (id: string): NexusWidget =>
    createNexusWidget(id, {
      flex: { basis: 'auto', grow: 2, shrink: 0.5, priority: 10 },
      bounds: { minWidth: 250, maxWidth: 400, minHeight: 200, maxHeight: 600 }
    }),

  /**
   * Flexible, low-priority widget
   */
  flexible: (id: string): NexusWidget =>
    createNexusWidget(id, {
      flex: { basis: 'auto', grow: 0.8, shrink: 1.5, priority: 3 },
      bounds: { minWidth: 150, maxWidth: 600, minHeight: 100, maxHeight: 800 }
    }),

  /**
   * Fixed-size widget
   */
  fixed: (id: string, width: number, height: number): NexusWidget =>
    createNexusWidget(id, {
      flex: { basis: 'content', grow: 0, shrink: 0, priority: 10 },
      bounds: { minWidth: width, maxWidth: width, minHeight: height, maxHeight: height }
    }),

  /**
   * Responsive widget
   */
  responsive: (id: string): NexusWidget =>
    createNexusWidget(id, {
      flex: { basis: 'auto', grow: 1.2, shrink: 0.8, priority: 5 },
      bounds: { minWidth: 200, maxWidth: 800, minHeight: 150, maxHeight: 700 }
    })
}
