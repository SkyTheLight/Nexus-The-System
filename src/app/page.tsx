  // Load widget visibility from localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem('widget-visibility')
    if (savedVisibility) {
      try {
        const visibilityMap = JSON.parse(savedVisibility)
        setLayout(prev => prev.map((widget: any) => ({
          ...widget,
          visible: visibilityMap[widget.widget_id] ?? widget.visible
        })))
      } catch (e) {
        console.error('Failed to load widget visibility:', e)
      }
    }
  }, [])

  // Save widget visibility to localStorage
  useEffect(() => {
    const visibilityMap = Object.fromEntries(
      layout.map((w: any) => [w.widget_id, w.visible])
    )
    localStorage.setItem('widget-visibility', JSON.stringify(visibilityMap))
  }, [layout])

  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout(prev => prev.map(w => 
      w.widget_id === widgetId ? { ...w, visible: !w.visible } : w
    ))
  }