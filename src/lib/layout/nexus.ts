/**
 * NEXUS: Node-Based Elastic Expression of Unified Space
 * 
 * Revolutionary widget layout system that stores relational constraints
 * instead of absolute coordinates. Widgets "negotiate" space through
 * a constraint satisfaction engine inspired by elastic systems.
 */

/* ═══════════════════════════════════════════════════════════════════════ */
/* ── Core Types ─────────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */

export type Direction = 'top' | 'right' | 'bottom' | 'left'
export type Axis = 'horizontal' | 'vertical'

/**
 * Flex behavior - how a widget prefers to grow, shrink, and allocate space
 */
export interface FlexBehavior {
  basis: 'content' | 'auto' | number
  grow: number        // Growth preference (1.0 = normal, 1.5 = aggressive)
  shrink: number      // Shrink tolerance (1.0 = normal, 0.5 = resistant)
  priority: number    // Resolution priority (10 = high, 1 = low)
}

/**
 * Size boundaries for widgets
 */
export interface SizeBounds {
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
}

/**
 * Base constraint type - describes relationships between widgets
 */
export type RelationalConstraint =
  | {
      type: 'adjacent-to'
      target: string
      direction: Direction
      spacing: number
    }
  | {
      type: 'aligned-with'
      target: string
      axis: Axis
    }
  | {
      type: 'stacked'
      target: string
      above: boolean
    }
  | {
      type: 'max-width' | 'max-height'
      value: number
    }
  | {
      type: 'min-width' | 'min-height'
      value: number
    }
  | {
      type: 'aspect-ratio'
      ratio: number
    }

/**
 * NEXUS Widget - the core unit in the constraint graph
 */
export interface NexusWidget {
  id: string
  
  // Flex behavior (not absolute position)
  flex: FlexBehavior
  
  // Size boundaries
  bounds: SizeBounds
  
  // Relational constraints (the magic)
  constraints: RelationalConstraint[]
  
  // Current resolved position (calculated, not stored)
  resolvedLayout?: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Pressure signal - how much a widget is "pushing" against constraints
 */
export interface PressureSignal {
  sourceId: string
  outward: number      // Magnitude of pressure
  direction: Direction
  intensity: number    // Based on flex.grow
  timestamp: number
}

/**
 * Conflict when constraint cannot be satisfied
 */
export interface ConstraintConflict {
  widgetId: string
  constraintIndex: number
  reason: string
  suggestedResolution: 'shrink' | 'move' | 'relax'
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ── Constraint Graph ──────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */

export class NexusGraph {
  private nodes: Map<string, NexusWidget> = new Map()
  private edges: Map<string, string[]> = new Map() // widget -> dependent widgets
  private pressureHistory: PressureSignal[] = []

  addWidget(widget: NexusWidget): void {
    this.nodes.set(widget.id, widget)
    this.buildEdges()
  }

  removeWidget(id: string): void {
    this.nodes.delete(id)
    this.edges.delete(id)
    this.buildEdges()
  }

  getWidget(id: string): NexusWidget | undefined {
    return this.nodes.get(id)
  }

  getAllWidgets(): NexusWidget[] {
    return Array.from(this.nodes.values())
  }

  updateWidget(id: string, updates: Partial<NexusWidget>): void {
    const widget = this.nodes.get(id)
    if (widget) {
      this.nodes.set(id, { ...widget, ...updates })
      this.buildEdges()
    }
  }

  /**
   * Find all widgets that could be affected by changes to a widget
   */
  getAffectedWidgets(sourceId: string): string[] {
    const affected = new Set<string>()
    const visited = new Set<string>()
    
    const traverse = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)
      
      const dependents = this.edges.get(id) || []
      for (const dep of dependents) {
        affected.add(dep)
        traverse(dep)
      }
    }
    
    traverse(sourceId)
    return Array.from(affected)
  }

  /**
   * Get widgets that directly constrain another widget
   */
  getDependencies(id: string): string[] {
    const widget = this.nodes.get(id)
    if (!widget) return []
    
    return widget.constraints
      .filter((c): c is RelationalConstraint & { target: string } => 'target' in c)
      .map(c => c.target)
  }

  /**
   * Rebuild edge map (dependency graph)
   */
  private buildEdges(): void {
    this.edges.clear()
    
    for (const widget of this.nodes.values()) {
      const deps = this.getDependencies(widget.id)
      for (const dep of deps) {
        if (!this.edges.has(dep)) this.edges.set(dep, [])
        this.edges.get(dep)!.push(widget.id)
      }
    }
  }

  recordPressure(signal: PressureSignal): void {
    this.pressureHistory.push(signal)
    // Keep last 100 signals
    if (this.pressureHistory.length > 100) {
      this.pressureHistory.shift()
    }
  }

  getPressureHistory(): PressureSignal[] {
    return [...this.pressureHistory]
  }
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ── Pressure System ────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */

export class PressureSystem {
  /**
   * Calculate pressure when a widget is resized
   */
  static calculateResizePressure(
    widget: NexusWidget,
    sizeDelta: { width: number; height: number }
  ): PressureSignal {
    const outward = Math.abs(sizeDelta.width) + Math.abs(sizeDelta.height)
    
    return {
      sourceId: widget.id,
      outward,
      direction: sizeDelta.width > 0 ? 'right' : 'left',
      intensity: widget.flex.grow,
      timestamp: Date.now()
    }
  }

  /**
   * Calculate pressure when a widget is dragged
   */
  static calculateDragPressure(
    widget: NexusWidget,
    distance: number
  ): PressureSignal {
    return {
      sourceId: widget.id,
      outward: distance,
      direction: 'right',
      intensity: widget.flex.grow * 0.5, // Drag has less intensity
      timestamp: Date.now()
    }
  }

  /**
   * Determine if a widget can accommodate pressure
   */
  static canAccommodate(
    widget: NexusWidget,
    pressure: PressureSignal
  ): boolean {
    // Can shrink?
    if (widget.flex.shrink > 0.5) return true
    // Can move?
    if (widget.flex.priority < 10) return true
    return false
  }

  /**
   * Propagate pressure through constraint graph
   */
  static propagatePressure(
    graph: NexusGraph,
    initialPressure: PressureSignal,
    maxDepth: number = 3
  ): PressureSignal[] {
    const signals: PressureSignal[] = [initialPressure]
    const queue: Array<{ signal: PressureSignal; depth: number }> = [
      { signal: initialPressure, depth: 0 }
    ]
    const visited = new Set<string>()

    while (queue.length > 0 && queue[0].depth < maxDepth) {
      const { signal, depth } = queue.shift()!
      const affected = graph.getAffectedWidgets(signal.sourceId)

      for (const affectedId of affected) {
        if (visited.has(affectedId)) continue
        visited.add(affectedId)

        const affectedWidget = graph.getWidget(affectedId)
        if (!affectedWidget) continue

        // Decay pressure with distance
        const decayedPressure: PressureSignal = {
          ...signal,
          sourceId: affectedId,
          outward: signal.outward * (1 - 0.2 * depth),
          intensity: signal.intensity * (1 - 0.15 * depth),
          timestamp: Date.now()
        }

        signals.push(decayedPressure)
        graph.recordPressure(decayedPressure)

        queue.push({ signal: decayedPressure, depth: depth + 1 })
      }
    }

    return signals
  }
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ── Constraint Solver ─────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */

export interface LayoutPosition {
  x: number
  y: number
  width: number
  height: number
}

export type LayoutSolution = Map<string, LayoutPosition>

export class ConstraintSolver {
  private maxIterations: number = 5
  private convergenceThreshold: number = 1 // pixels

  constructor(maxIterations: number = 5) {
    this.maxIterations = maxIterations
  }

  /**
   * Solve the complete constraint graph and produce positions
   */
  solve(graph: NexusGraph, containerWidth: number): LayoutSolution {
    const layout = new Map<string, LayoutPosition>()
    const widgets = graph.getAllWidgets()

    // Initialize with placeholder positions
    let y = 0
    for (const widget of widgets) {
      layout.set(widget.id, {
        x: 0,
        y,
        width: Math.min(widget.bounds.maxWidth, containerWidth),
        height: widget.bounds.minHeight
      })
      y += widget.bounds.minHeight + 16 // 16px gap
    }

    // Iteratively refine solution
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      const previousLayout = new Map(layout)
      
      for (const widget of this.topologicalSort(graph)) {
        const position = this.resolveWidget(widget, graph, layout, containerWidth)
        layout.set(widget.id, position)
      }

      if (this.hasConverged(layout, previousLayout)) {
        break
      }
    }

    return layout
  }

  /**
   * Resolve a single widget's position given constraints
   */
  private resolveWidget(
    widget: NexusWidget,
    graph: NexusGraph,
    currentLayout: LayoutSolution,
    containerWidth: number
  ): LayoutPosition {
    let x = 0
    let y = 0
    let width = Math.min(widget.bounds.maxWidth, containerWidth)
    let height = widget.bounds.minHeight

    // Process each constraint
    for (const constraint of widget.constraints) {
      if (constraint.type === 'adjacent-to') {
        const targetLayout = currentLayout.get(constraint.target)
        if (targetLayout) {
          if (constraint.direction === 'right') {
            x = targetLayout.x + targetLayout.width + constraint.spacing
          } else if (constraint.direction === 'left') {
            x = Math.max(0, targetLayout.x - width - constraint.spacing)
          } else if (constraint.direction === 'bottom') {
            y = targetLayout.y + targetLayout.height + constraint.spacing
          } else if (constraint.direction === 'top') {
            y = Math.max(0, targetLayout.y - height - constraint.spacing)
          }
        }
      } else if (constraint.type === 'aligned-with') {
        const targetLayout = currentLayout.get(constraint.target)
        if (targetLayout) {
          if (constraint.axis === 'horizontal') {
            x = targetLayout.x
          } else if (constraint.axis === 'vertical') {
            y = targetLayout.y
          }
        }
      } else if (constraint.type === 'max-width') {
        width = Math.min(width, constraint.value)
      } else if (constraint.type === 'max-height') {
        height = Math.min(height, constraint.value)
      } else if (constraint.type === 'min-width') {
        width = Math.max(width, constraint.value)
      } else if (constraint.type === 'min-height') {
        height = Math.max(height, constraint.value)
      } else if (constraint.type === 'aspect-ratio') {
        height = width / constraint.ratio
      }
    }

    // Clamp to bounds
    width = Math.max(widget.bounds.minWidth, Math.min(width, widget.bounds.maxWidth))
    height = Math.max(widget.bounds.minHeight, Math.min(height, widget.bounds.maxHeight))
    x = Math.max(0, Math.min(x, containerWidth - width))

    return { x, y, width, height }
  }

  /**
   * Topological sort of widgets based on constraints
   */
  private topologicalSort(graph: NexusGraph): NexusWidget[] {
    const widgets = graph.getAllWidgets()
    const visited = new Set<string>()
    const result: NexusWidget[] = []

    const visit = (widget: NexusWidget) => {
      if (visited.has(widget.id)) return
      visited.add(widget.id)

      const deps = graph.getDependencies(widget.id)
      for (const depId of deps) {
        const dep = graph.getWidget(depId)
        if (dep) visit(dep)
      }

      result.push(widget)
    }

    for (const widget of widgets) {
      visit(widget)
    }

    return result
  }

  /**
   * Check if layout has converged
   */
  private hasConverged(current: LayoutSolution, previous: LayoutSolution): boolean {
    for (const [id, pos] of current) {
      const prevPos = previous.get(id)
      if (!prevPos) return false
      
      const deltaX = Math.abs(pos.x - prevPos.x)
      const deltaY = Math.abs(pos.y - prevPos.y)
      const deltaW = Math.abs(pos.width - prevPos.width)
      const deltaH = Math.abs(pos.height - prevPos.height)

      if (
        deltaX > this.convergenceThreshold ||
        deltaY > this.convergenceThreshold ||
        deltaW > this.convergenceThreshold ||
        deltaH > this.convergenceThreshold
      ) {
        return false
      }
    }
    return true
  }
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ── NEXUS Engine (Main Orchestrator) ───────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */

export class NexusEngine {
  private graph: NexusGraph
  private solver: ConstraintSolver
  private containerWidth: number
  private currentLayout: LayoutSolution
  private resizeObserver?: ResizeObserver

  constructor(containerWidth: number = 1200) {
    this.graph = new NexusGraph()
    this.solver = new ConstraintSolver()
    this.containerWidth = containerWidth
    this.currentLayout = new Map()
  }

  /**
   * Initialize with widgets
   */
  init(widgets: NexusWidget[]): void {
    for (const widget of widgets) {
      this.graph.addWidget(widget)
    }
    this.reflow()
  }

  /**
   * Add a new widget to the layout
   */
  addWidget(widget: NexusWidget): void {
    this.graph.addWidget(widget)
    this.reflow()
  }

  /**
   * Remove a widget
   */
  removeWidget(id: string): void {
    this.graph.removeWidget(id)
    this.reflow()
  }

  /**
   * Handle widget resize
   */
  resizeWidget(
    widgetId: string,
    newWidth: number,
    newHeight: number
  ): void {
    const widget = this.graph.getWidget(widgetId)
    if (!widget) return

    const oldLayout = this.currentLayout.get(widgetId)
    if (!oldLayout) return

    // Calculate pressure
    const sizeDelta = {
      width: newWidth - oldLayout.width,
      height: newHeight - oldLayout.height
    }

    const pressure = PressureSystem.calculateResizePressure(widget, sizeDelta)
    
    // Propagate pressure to affected widgets
    const pressureSignals = PressureSystem.propagatePressure(this.graph, pressure)
    
    // Update widget bounds
    const updatedWidget = {
      ...widget,
      bounds: {
        ...widget.bounds,
        minWidth: newWidth,
        maxWidth: newWidth
      }
    }
    
    this.graph.updateWidget(widgetId, updatedWidget)
    
    // Reflow with new constraints
    this.reflow()
  }

  /**
   * Handle widget drag
   */
  dragWidget(
    widgetId: string,
    newX: number,
    newY: number,
    proximity: string[]
  ): void {
    const widget = this.graph.getWidget(widgetId)
    if (!widget) return

    const oldLayout = this.currentLayout.get(widgetId)
    if (!oldLayout) return

    // Calculate distance moved
    const distance = Math.hypot(newX - oldLayout.x, newY - oldLayout.y)
    
    // Generate pressure for drag
    const pressure = PressureSystem.calculateDragPressure(widget, distance)
    PressureSystem.propagatePressure(this.graph, pressure)

    // Detect new relationships from proximity
    const newConstraints = this.detectProximityConstraints(widgetId, proximity)
    
    const updatedWidget = {
      ...widget,
      constraints: newConstraints
    }
    
    this.graph.updateWidget(widgetId, updatedWidget)
    this.reflow()
  }

  /**
   * Update container width (responsive)
   */
  setContainerWidth(width: number): void {
    if (this.containerWidth !== width) {
      this.containerWidth = width
      this.reflow()
    }
  }

  /**
   * Detect proximity-based constraints when dragging
   */
  private detectProximityConstraints(
    widgetId: string,
    nearbyIds: string[]
  ): RelationalConstraint[] {
    const constraints: RelationalConstraint[] = []
    
    for (const nearbyId of nearbyIds) {
      // Simple heuristic: adjacent-to on the right
      constraints.push({
        type: 'adjacent-to',
        target: nearbyId,
        direction: 'right',
        spacing: 16
      })
    }

    return constraints
  }

  /**
   * Main reflow - solve constraints and update layout
   */
  reflow(): LayoutSolution {
    this.currentLayout = this.solver.solve(this.graph, this.containerWidth)
    
    // Update resolved layouts in widgets
    for (const [id, position] of this.currentLayout) {
      const widget = this.graph.getWidget(id)
      if (widget) {
        this.graph.updateWidget(id, {
          resolvedLayout: position
        })
      }
    }

    return this.currentLayout
  }

  /**
   * Get current layout solution
   */
  getLayout(): LayoutSolution {
    return new Map(this.currentLayout)
  }

  /**
   * Get all widgets with resolved positions
   */
  getResolvedWidgets(): NexusWidget[] {
    return this.graph.getAllWidgets()
  }

  /**
   * Get pressure history for visualization/debugging
   */
  getPressureHistory(): PressureSignal[] {
    return this.graph.getPressureHistory()
  }

  /**
   * Export constraints for persistence
   */
  exportConstraints(): Array<{
    id: string
    flex: FlexBehavior
    bounds: SizeBounds
    constraints: RelationalConstraint[]
  }> {
    return this.graph.getAllWidgets().map(w => ({
      id: w.id,
      flex: w.flex,
      bounds: w.bounds,
      constraints: w.constraints
    }))
  }

  /**
   * Import constraints for restoration
   */
  importConstraints(data: Array<{
    id: string
    flex: FlexBehavior
    bounds: SizeBounds
    constraints: RelationalConstraint[]
  }>): void {
    this.graph = new NexusGraph()
    for (const item of data) {
      this.graph.addWidget({
        id: item.id,
        flex: item.flex,
        bounds: item.bounds,
        constraints: item.constraints
      })
    }
    this.reflow()
  }
}
