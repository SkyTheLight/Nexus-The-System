'use client'

import { useState, useEffect } from 'react'
import { MapPin, Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react'

interface WeatherData {
  temperature: number
  description: string
  humidity: number
  wind_speed: number
  city: string
  icon: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)

  async function loadWeather() {
    setLoading(true)
    try {
      const [kamuningRes, sanMateoRes] = await Promise.all([
        fetch('https://api.open-meteo.com/v1/forecast?latitude=14.7167&longitude=121.0367&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia/Manila'),
        fetch('https://api.open-meteo.com/v1/forecast?latitude=14.5844&longitude=121.1881&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia/Manila')
      ])
      
      const kamuning = await kamuningRes.json()
      const sanMateo = await sanMateoRes.json()
      
      setWeather([
        {
          temperature: Math.round(kamuning.current.temperature_2m),
          description: getWeatherDescription(kamuning.current.weather_code),
          humidity: kamuning.current.relative_humidity_2m,
          wind_speed: Math.round(kamuning.current.wind_speed_10m),
          city: 'Kamuning, QC',
          icon: getWeatherIcon(kamuning.current.weather_code)
        },
        {
          temperature: Math.round(sanMateo.current.temperature_2m),
          description: getWeatherDescription(sanMateo.current.weather_code),
          humidity: sanMateo.current.relative_humidity_2m,
          wind_speed: Math.round(sanMateo.current.wind_speed_10m),
          city: 'San Mateo, Rizal',
          icon: getWeatherIcon(sanMateo.current.weather_code)
        }
      ])
    } catch (error) {
      console.error('Weather fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadWeather() }, [])

  if (loading) return <div className="text-muted-foreground text-sm p-4">Loading weather...</div>
  if (weather.length === 0) return <div className="text-muted-foreground text-sm p-4">Weather unavailable</div>

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Weather</h3>
        <button onClick={loadWeather} className="p-1 hover:bg-accent rounded">
          <RefreshCw size={14} />
        </button>
      </div>
      
      <div className="flex-1 space-y-3">
        {weather.map((w, i) => (
          <div key={i} className="flex items-center gap-3 p-2 bg-accent/50 rounded-lg">
            <div className="text-2xl">{w.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{w.temperature}°C</span>
                <span className="text-xs text-muted-foreground">{w.description}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <MapPin size={10} /> {w.city}
                <span>💧 {w.humidity}%</span>
                <span>💨 {w.wind_speed} km/h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers',
    82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
  }
  return map[code] || 'Unknown'
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 65) return '🌧️'
  if (code <= 75) return '🌨️'
  if (code <= 82) return '🌦️'
  if (code <= 86) return '🌨️'
  if (code >= 95) return '⛈️'
  return '🌤️'
}
