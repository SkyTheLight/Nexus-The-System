export interface WMOInfo {
  label: string
  icon: string // lucide-react icon name
}

export function getWMOInfo(code: number): WMOInfo {
  if (code === 0) return { label: 'Clear Sky', icon: 'Sun' }
  if (code <= 3) return { label: 'Partly Cloudy', icon: 'CloudSun' }
  if (code === 45 || code === 48) return { label: 'Foggy', icon: 'CloudFog' }
  if (code === 51 || code === 53 || code === 55) return { label: 'Drizzle', icon: 'CloudDrizzle' }
  if (code === 61 || code === 63 || code === 65) return { label: 'Rainy', icon: 'CloudRain' }
  if (code === 71 || code === 73 || code === 75) return { label: 'Snowy', icon: 'CloudSnow' }
  if (code === 80 || code === 81 || code === 82) return { label: 'Showers', icon: 'CloudRain' }
  if (code === 95) return { label: 'Thunderstorm', icon: 'CloudLightning' }
  return { label: 'Unknown', icon: 'Cloud' }
}
