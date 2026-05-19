"use client"

import React from "react"

export class PageErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("PageErrorBoundary caught:", error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#d7b36a', background: '#06060a', minHeight: '100vh' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>⚠ Page Error</div>
          <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', color: '#ff6b6b' }}>{this.state.error.message}</pre>
          <pre style={{ fontSize: 10, whiteSpace: 'pre-wrap', color: '#888', marginTop: 8 }}>{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
