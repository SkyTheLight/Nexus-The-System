import { useState, useEffect, useCallback } from 'react'
import { WMO_CODE_MAP } from './config'

interface WeatherData {
  city: string
  temp_c: number
  condition: string
  humidity: number
  feels_like_c: number
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Get geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords

      // Fetch city name
      let city = 'Unknown Location'
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { 'User-Agent': 'Adversity/1.0' } }
        )
        const geoData = await geoRes.json()
        city = geoData.address?.city ||
              geoData.address?.municipality ||
              geoData.address?.town ||
              'Unknown'
      } catch (e) {
        console.error('Geocode failed:', e)
      }

      // Fetch weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code&timezone=auto`
      )
      const weatherData = await weatherRes.json()

      const code = weatherData.current.weather_code
      setWeather({
        city,
        temp_c: Math.round(weatherData.current.temperature_2m),
        condition: WMO_CODE_MAP[code] || 'Unknown',
        humidity: weatherData.current.relative_humidity_2m,
        feels_like_c: Math.round(weatherData.current.apparent_temperature)
      })
    } catch (e: any) {
      console.error('Weather fetch failed:', e)
      setError('Location access denied.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  return { weather, loading, error, refetch: fetchWeather }
}
