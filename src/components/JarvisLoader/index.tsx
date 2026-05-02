'use client'

import { useState, useEffect } from 'react'
import { getGreeting } from './config'
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
}

export default function JARVISLoader({
  userName = 'Sir',
  canvasDomain = '',
  canvasToken = '',
  courseIds = [],
  onComplete,
}: JARVISLoaderProps) {
  const [visible, setVisible] = useState(true)
  const [time, setTime] = useState(new Date())

  const greeting = getGreeting()
  const { weather, weatherError } = useWeather()
  const { quote } = useQuote()
  const { announcements, assignments, canvasLoading } = useCanvasData(
    canvasDomain,
    canvasToken,
    courseIds
  )

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-hide after 8 seconds - fire once on mount
  useEffect(() => {
    console.log('[JARVIS] Starting 8s timer')
    const timer = setTimeout(() => {
      console.log('[JARVIS] Timer fired - hiding')
      setVisible(false)
      onComplete?.()
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const timeStr = time.toLocaleTimeString('en-GB', { hour12: false })

  return (
    <div className="jarvis-container">
      <div className="scan-line" />
      
      <div className="panels-container">
        <div className="panel">
          <div className="panel-label">SYSTEM GREETING</div>
          <div className="greeting-text">{greeting}, {userName}.</div>
        </div>

        <div className="panel" style={{ padding: '8px 0' }}>
          <div style={{ height: '1px', background: '#00d4ff22' }} />
        </div>

        <div className="panel">
          <div className="panel-label">CANVAS — ANNOUNCEMENTS</div>
          {canvasLoading ? (
            <div className="empty-state">Loading...</div>
          ) : announcements.length > 0 ? (
            announcements.map((a, i) => (
              <div key={i} className="list-item">
                <div className="dot" />
                <div className="item-title">{a.title}</div>
                <div className="item-meta">{a.course}</div>
              </div>
            ))
          ) : (
            <div className="empty-state">No announcements.</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-label">CANVAS — ASSIGNMENTS</div>
          {canvasLoading ? (
            <div className="empty-state">Loading...</div>
          ) : assignments.length > 0 ? (
            assignments.map((a, i) => (
              <div key={i} className="list-item">
                <div className={`dot ${a.urgency}`} />
                <div className="item-title">{a.title}</div>
                <div className="item-meta">{a.course}</div>
              </div>
            ))
          ) : (
            <div className="empty-state">No assignments.</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-label">WEATHER — {weather?.city || 'LOADING...'}</div>
          {weatherError ? (
            <div className="empty-state">{weatherError}</div>
          ) : weather ? (
            <div className="weather-info">
              <div className="weather-temp">{weather.temperature}°C</div>
              <div className="weather-details">
                <div className="weather-detail">{weather.weatherInfo?.label || weather.condition}</div>
                <div className="weather-detail">Humidity: {weather.humidity}%</div>
              </div>
            </div>
          ) : (
            <div className="empty-state">Loading weather...</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-label">SYSTEM — MOTIVATION</div>
          {quote ? (
            <>
              <div className="quote-text">"{quote.quote}"</div>
              <div className="quote-author">— {quote.author}</div>
            </>
          ) : (
            <div className="empty-state">Loading quote...</div>
          )}
        </div>
      </div>

      <div className="status-bar">
        <div className="status-left">
          <div className="dot" style={{ background: '#00d4ff' }} />
          SYSTEM ONLINE
        </div>
        <div className="status-center">{timeStr}</div>
        <div className="status-right">ALL SYSTEMS NOMINAL</div>
      </div>
    </div>
  )
}
