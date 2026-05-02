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

    // Manila fallback coordinates
    let lat = 14.5995
    let lon = 120.9842
    let city = 'Manila, PH'

    try {
      // Geolocation with timeout (Bug 4 fix)
      const getPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'))
          return
        }

        const timeout = setTimeout(() => {
          reject(new Error('Geolocation timeout'))
        }, 3000) // 3 second max wait

        navigator.geolocation.getCurrentPosition(
          (pos) => { clearTimeout(timeout); resolve(pos) },
          (err) => { clearTimeout(timeout); reject(err) },
          { timeout: 3000, maximumAge: 300000 }
        )
      })

      try {
        const position = await getPosition()
        lat = position.coords.latitude
        lon = position.coords.longitude

        // Try to get city name
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'User-Agent': 'Adversity/1.0' } }
          )
          const geoData = await geoRes.json()
          city = geoData.address?.city ||
                geoData.address?.municipality ||
                geoData.address?.town ||
                'Unknown'
        } catch {
          // Use coordinates as city name
          city = `${lat.toFixed(2)}, ${lon.toFixed(2)}`
        }
      } catch (geoError) {
        console.log('[Weather] Using Manila fallback:', geoError)
        // Keep Manila defaults
      }

      // Fetch weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code&timezone=auto`
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
      setError('Weather unavailable.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  return { weather, loading, error, refetch: fetchWeather }
}
