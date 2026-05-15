import { useState, useEffect, useCallback } from 'react'
import { getWMOInfo, type WMOInfo } from './wmoMap'

export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  weatherCode: number
  weatherInfo: WMOInfo
  city: string
  lat: number
  lon: number
  loading: boolean
  error: string | null
}

interface OpenMeteoCurrent {
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  wind_speed_10m: number
  weather_code: number
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent
}

interface NominatimResponse {
  address?: {
    city?: string
    town?: string
    municipality?: string
    county?: string
  }
}

export interface LocationPreset {
  name: string
  lat: number
  lon: number
}

export const LOCATION_PRESETS: LocationPreset[] = [
  { name: 'Kamuning, QC', lat: 14.7167, lon: 121.0367 },
  { name: 'San Mateo, Rizal', lat: 14.5844, lon: 121.1881 },
  { name: 'Taytay, Rizal', lat: 14.5667, lon: 121.1361 }
]

const CACHE_KEY = 'weather-cache'
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

interface CacheEntry {
  data: WeatherData
  timestamp: number
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)
  const [usingPreset, setUsingPreset] = useState(false)

  const fetchWeather = useCallback(async (locationIndex?: number) => {
    setLoading(true)
    setError(null)

    const presetIndex = locationIndex !== undefined ? locationIndex : selectedLocationIndex

    // Check cache first (use location-specific cache key)
    try {
      const cacheKey = usingPreset ? `${CACHE_KEY}-preset-${presetIndex}` : CACHE_KEY
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached)
        if (Date.now() - entry.timestamp < CACHE_DURATION) {
          setWeather(entry.data)
          setLoading(false)
          return
        }
      }
    } catch {
      // ignore cache errors
    }

    // Try GPS first if not using preset
    if (!usingPreset && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 3000, // 3s timeout
            maximumAge: 0
          })
        })

        const lat = position.coords.latitude
        const lon = position.coords.longitude

        const data = await fetchWeatherData(lat, lon)
        if (data) {
          setWeather(data)
          setUsingPreset(false)
          cacheWeatherData(data, CACHE_KEY)
        }
        setLoading(false)
        return
      } catch {
        // GPS failed, fall through to preset
      }
    }

    // Use preset location
    const preset = LOCATION_PRESETS[presetIndex] || LOCATION_PRESETS[0]
    setUsingPreset(true)
    setSelectedLocationIndex(presetIndex)

    const data = await fetchWeatherData(preset.lat, preset.lon, preset.name)
    if (data) {
      setWeather(data)
      cacheWeatherData(data, `${CACHE_KEY}-preset-${presetIndex}`)
    }
    setLoading(false)
  }, [selectedLocationIndex, usingPreset])

  const switchLocation = useCallback((index: number) => {
    setSelectedLocationIndex(index)
    fetchWeather(index)
  }, [fetchWeather])

  useEffect(() => {
    fetchWeather()

    const interval = setInterval(() => fetchWeather(), 10 * 60 * 1000) // 10 min
    return () => clearInterval(interval)
  }, [fetchWeather])

  return { weather, loading, error, refetch: fetchWeather, usingPreset, selectedLocationIndex, switchLocation, locationPresets: LOCATION_PRESETS }
}

async function fetchWeatherData(lat: number, lon: number, presetName?: string): Promise<WeatherData | null> {
  try {
    const [weatherRes, geoRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
        `&wind_speed_unit=kmh&temperature_unit=celsius&timezone=auto`
      ),
      presetName ? null : fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
        headers: { 'User-Agent': 'Adversity-Dashboard/1.0' }
      })
    ])

    if (!weatherRes.ok) throw new Error('Weather unavailable.')

    const weatherData: OpenMeteoResponse = await weatherRes.json()
    const current = weatherData.current

    let city = presetName || 'Unknown Location'
    if (!presetName && geoRes && geoRes.ok) {
      try {
        const geoData: NominatimResponse = await geoRes.json()
        city = geoData.address?.city || geoData.address?.town || geoData.address?.municipality || geoData.address?.county || 'Unknown Location'
      } catch {
        // use default
      }
    }

    const weatherInfo = getWMOInfo(current.weather_code)
    return {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      weatherCode: current.weather_code,
      weatherInfo,
      city,
      lat,
      lon,
      loading: false,
      error: null
    }
  } catch {
    return null
  }
}

function cacheWeatherData(data: WeatherData, key: string) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    } as CacheEntry))
  } catch {
    // ignore
  }
}
