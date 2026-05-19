"use client"

import { useEffect, useState } from "react"
import { GRID_COLS_LG } from "@/lib/layout"

interface GridBackdropProps {
  rowHeight: number
  margin: [number, number]
  cols?: number
  active?: boolean
}

export function GridBackdrop({
  rowHeight,
  margin,
  cols = GRID_COLS_LG,
  active = false,
}: GridBackdropProps) {
  const [steps, setSteps] = useState({ col: "0px", row: "0px" })

  useEffect(() => {
    const surface = document.querySelector(".adversity-grid-surface")
    if (!surface) return

    const update = () => {
      const w = surface.clientWidth
      const [mx, my] = margin
      const colWidth = (w - mx * (cols - 1)) / cols
      setSteps({
        col: `${colWidth + mx}px`,
        row: `${rowHeight + my}px`,
      })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(surface)
    return () => ro.disconnect()
  }, [rowHeight, margin, cols])

  return (
    <div
      className={`adversity-grid-backdrop${active ? " is-active" : ""}`}
      style={
        {
          "--grid-col-step": steps.col,
          "--grid-row-step": steps.row,
        } as React.CSSProperties
      }
      aria-hidden
    />
  )
}
