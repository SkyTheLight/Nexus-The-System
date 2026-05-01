'use client'

import { useEffect } from 'react'
import { Sun, CloudSun, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Cloud, RefreshCw, MapPin, Thermometer, Droplets, Wind } from 'lucide-react'
import { useWeather } from './useWeather'
import type { WeatherData } from './useWeather'

const iconMap: Record<string, any> = {
  Sun, CloudSun, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Cloud
}

export default function WeatherWidget() {
  const { weather, loading, error, refetch } = useWeather()

  if (loading) return <div className="text-muted-foreground text-sm p-4">LOADING...</div>
  if (error) return <div className="text-muted-foreground text-sm p-4">{error}</div>
  if (!weather) return <div className="text-muted-foreground text-sm p-4">Weather unavailable.</div>

  const IconComponent = iconMap[weather.weatherInfo.icon] || Cloud

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">WEATHER</h3>
        <button onClick={refetch} className="p-1 hover:bg-white/5 rounded transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-4">
          <IconComponent size={48} className="text-[#00d4ff]" />
          <div>
            <div className="text-4xl font-bold">{weather.temperature}°C</div>
            <div className="text-xs text-[#00d4ff88]">{weather.weatherInfo.label}</div>
          </div>
        </div>

        <div className="text-sm text-[#00d4ffcc] mb-1">
          Feels like: {weather.feelsLike}°C
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Droplets size={12} /> {weather.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind size={12} /> {weather.windSpeed} km/h
          </span>
        </div>

        <div className="flex items-center gap-1 mt-3 text-xs text-[#00d4ff88]">
          <MapPin size={10} /> {weather.city}
        </div>
      </div>
    </div>
  )
}
