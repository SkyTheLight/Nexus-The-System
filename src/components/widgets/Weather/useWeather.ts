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

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY)
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

    // Get GPS location
    if (!navigator.geolocation) {
      setError('Location access denied.')
      setLoading(false)
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const lat = position.coords.latitude
      const lon = position.coords.longitude

      // Fetch weather and location in parallel
      const [weatherRes, geoRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
          `&wind_speed_unit=kmh&temperature_unit=celsius&timezone=auto`
        ),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
          headers: { 'User-Agent': 'Adversity-Dashboard/1.0' }
        })
      ])

      if (!weatherRes.ok) throw new Error('Weather unavailable.')

      const weatherData: OpenMeteoResponse = await weatherRes.json()
      const current = weatherData.current

      let city = 'Unknown Location'
      try {
        if (geoRes.ok) {
          const geoData: NominatimResponse = await geoRes.json()
          city = geoData.address?.city || geoData.address?.town || geoData.address?.municipality || geoData.address?.county || 'Unknown Location'
        }
      } catch {
        // use default city name
      }

      const weatherInfo = getWMOInfo(current.weather_code)
      const data: WeatherData = {
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

      // Save to cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        } as CacheEntry))
      } catch {
        // ignore storage errors
      }

      setWeather(data)
    } catch (err) {
      const msg = err instanceof GeolocationPositionError ? 'Location access denied.' : 'Weather unavailable.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather()

    const interval = setInterval(fetchWeather, 10 * 60 * 1000) // 10 min
    return () => clearInterval(interval)
  }, [fetchWeather])

  return { weather, loading, error, refetch: fetchWeather }
}
