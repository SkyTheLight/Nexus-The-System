'use client'

import { useState, useEffect, useCallback } from 'react'
import { getGreeting, type FALLBACK_QUOTE } from './config'
import { useWeather } from './useWeather'
import { useQuote } from './useQuote'
import { useCanvasData } from './useCanvasData'
import './JarvisLoader.css'

interface JARVISLoaderProps {
  userName?: string
  canvasDomain?: string
  canvasToken?: string
  courseIds?: string[]
  onComplete?: () => void
  autoExit?: boolean
  exitDelay?: number
}

export default function JARVISLoader({
  userName = 'Sir',
  canvasDomain = '',
  canvasToken = '',
  courseIds = [],
  onComplete,
  autoExit = true,
  exitDelay = 3000
}: JARVISLoaderProps) {
  const [stage, setStage] = useState<'initializing' | 'displaying' | 'exiting' | 'done'>('initializing')
  const [time, setTime] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  console.log('[JARVIS] Rendering, stage:', stage, 'canvasDomain:', canvasDomain ? 'set' : 'missing')

  const greeting = getGreeting()
  const { weather, weatherLoading, weatherError } = useWeather()
  const { quote, quoteLoading } = useQuote()
  const { announcements, assignments, canvasLoading } = useCanvasData(
    canvasDomain,
    canvasToken,
    courseIds
  )

  if (error) {
    return (
      <div className="jarvis-container">
        <div className="initializing" style={{ color: 'red' }}>
          SYSTEM ERROR: {error}
          <br />
          <button onClick={() => { setError(null); setStage('initializing') }} style={{ marginTop: 20, padding: '8px 16px', background: '#00d4ff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            RETRY
          </button>
        </div>
      </div>
    )
  }

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Staggered animation sequence
  useEffect(() => {
  if (stage === 'initializing') {
      return (
        <div className="initializing">
          INITIALIZING SYSTEMS...
        </div>
      )
    }

    if (weatherLoading) {
      return (
        <div className="jarvis-container">
          <div className="initializing">ACQUIRING LOCATION...</div>
        </div>
      )
    }

    if (stage === 'displaying' && autoExit) {
      // Auto exit after all panels loaded + delay
      const totalTime = exitDelay + 2000 // panels animation time
      const timer = setTimeout(() => {
        setStage('exiting')
        setTimeout(() => {
          setStage('done')
          onComplete?.()
        }, 1000)
      }, totalTime)
      return () => clearTimeout(timer)
    }
  }, [stage, autoExit, exitDelay, onComplete])

  if (stage === 'done') return null

  const timeStr = time.toLocaleTimeString('en-GB', { hour12: false })

  return (
    <div className={`jarvis-container ${stage === 'exiting' ? 'fade-out' : ''}`}>
      {/* Scan Line */}
      <div className="scan-line" />

      {stage === 'initializing' ? (
        <div className="initializing">
          INITIALIZING SYSTEMS...
        </div>
      ) : (
        <>
          {/* Panels */}
          <div className="panels-container">
            {/* Greeting */}
            <div className="panel">
              <div className="panel-label">SYSTEM GREETING</div>
              <div className="greeting-text">
                {greeting}, {userName}.
              </div>
            </div>

            {/* Divider */}
            <div className="panel" style={{ padding: '8px 0' }}>
              <div style={{ height: '1px', background: '#00d4ff22' }} />
            </div>

            {/* Announcements */}
            <div className="panel">
              <div className="panel-label">CANVAS — ANNOUNCEMENTS</div>
              {canvasLoading ? (
                <div className="empty-state">Loading announcements...</div>
              ) : announcements.length > 0 ? (
                announcements.map((a, i) => (
                  <div key={i} className="list-item">
                    <div className="dot" />
                    <div className="item-title">{a.title}</div>
                    <div className="item-meta">{a.course}</div>
                    <div className="item-meta">{a.posted}</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No announcements detected.</div>
              )}
            </div>

            {/* Assignments */}
            <div className="panel">
              <div className="panel-label">CANVAS — ASSIGNMENTS DUE</div>
              {canvasLoading ? (
                <div className="empty-state">Loading assignments...</div>
              ) : assignments.length > 0 ? (
                assignments.map((a, i) => (
                  <div key={i} className="list-item">
                    <div className={`dot ${a.urgency}`} />
                    <div className="item-title">{a.title}</div>
                    <div className="item-meta">{a.course}</div>
                    <div className="item-meta">{a.due}</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No imminent assignments. Standing by.</div>
              )}
            </div>

            {/* Weather */}
            <div className="panel">
                <div className="panel-label">
                  WEATHER — {weather?.city || 'LOCATION PENDING...'}
                </div>
                {weatherError ? (
                  <div className="empty-state">{weatherError}</div>
                ) : weather ? (
                <div className="weather-info">
                  <div className="weather-temp">{weather.temperature}°C</div>
                  <div className="weather-details">
                    <div className="weather-detail">{weather.weatherInfo?.label || weather.condition}</div>
                    <div className="weather-detail">Humidity: {weather.humidity}%</div>
                    <div className="weather-detail">Feels like: {weather.feelsLike}°C</div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">Weather data unavailable.</div>
              )}
            </div>

            {/* Quote */}
            <div className="panel">
              <div className="panel-label">SYSTEM — MOTIVATION</div>
              {quoteLoading ? (
                <div className="empty-state">Loading quote...</div>
              ) : quote ? (
                <>
                  <div className="quote-text">"{quote.quote}"</div>
                  <div className="quote-author">— {quote.author}</div>
                </>
              ) : (
                <div className="empty-state">Quote unavailable.</div>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-left">
              <div className="dot" style={{ background: '#00d4ff' }} />
              SYSTEM ONLINE
            </div>
            <div className="status-center">{timeStr}</div>
            <div className="status-right">ALL SYSTEMS NOMINAL</div>
          </div>
        </>
      )}
    </div>
  )
}
