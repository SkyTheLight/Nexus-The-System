'use client'

import { useEffect, useRef } from 'react'

interface Blob {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
}

export default function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const blobs: Blob[] = []

    const colors = [
      'rgba(99, 102, 241, 0.15)',  // primary
      'rgba(139, 92, 246, 0.1)',   // purple
      'rgba(59, 130, 246, 0.1)',   // blue
      'rgba(236, 72, 153, 0.08)',  // pink
    ]

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize blobs
    for (let i = 0; i < 5; i++) {
      blobs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 150 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      blobs.forEach(blob => {
        blob.x += blob.vx
        blob.y += blob.vy

        // Bounce off walls
        if (blob.x - blob.radius < 0 || blob.x + blob.radius > canvas.width) blob.vx *= -1
        if (blob.y - blob.radius < 0 || blob.y + blob.radius > canvas.height) blob.vy *= -1

        // Draw blob
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius)
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
