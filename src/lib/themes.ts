export interface Theme {
  name: string
  id: string
  emoji: string
  description: string
  variables: Record<string, string>
}

export const themes: Theme[] = [
  {
    name: 'Default Dark',
    id: 'default-dark',
    emoji: '🌑',
    description: 'Current dark theme with purple accents',
    variables: {
      '--background': '#0a0a0a',
      '--card-bg': '#111113',
      '--border': 'rgba(255,255,255,0.1)',
      '--text': '#ffffff',
      '--text-muted': '#a1a1aa',
      '--primary': '#8b5cf6',
      '--primary-foreground': '#ffffff',
      '--accent': '#7c3aed',
    }
  },
  {
    name: 'Neon',
    id: 'neon',
    emoji: '🌈',
    description: 'Bright cyan, magenta, green accents on dark background',
    variables: {
      '--background': '#0a0a0f',
      '--card-bg': '#151520',
      '--border': 'rgba(0,255,255,0.2)',
      '--text': '#ffffff',
      '--text-muted': '#00ffff',
      '--primary': '#00ffff',
      '--primary-foreground': '#000000',
      '--accent': '#ff00ff',
    }
  },
  {
    name: 'Pastel',
    id: 'pastel',
    emoji: '🪷',
    description: 'Soft pinks, lavenders, mint on light background',
    variables: {
      '--background': '#fef7f7',
      '--card-bg': '#ffffff',
      '--border': 'rgba(219,39,119,0.2)',
      '--text': '#4a0040',
      '--text-muted': '#ec4899',
      '--primary': '#ec4899',
      '--primary-foreground': '#ffffff',
      '--accent': '#a855f7',
    }
  },
  {
    name: 'Retro',
    id: 'retro',
    emoji: '🕹️',
    description: 'Orange/amber on dark brown, pixel-style accents',
    variables: {
      '--background': '#1a0f05',
      '--card-bg': '#2a1a0a',
      '--border': 'rgba(255,165,0,0.3)',
      '--text': '#ffb74d',
      '--text-muted': '#ffa726',
      '--primary': '#ff9800',
      '--primary-foreground': '#000000',
      '--accent': '#ff5722',
    }
  },
  {
    name: 'Minimal',
    id: 'minimal',
    emoji: '☀️',
    description: 'Clean white background, black text, gray accents',
    variables: {
      '--background': '#ffffff',
      '--card-bg': '#f5f5f5',
      '--border': 'rgba(0,0,0,0.1)',
      '--text': '#000000',
      '--text-muted': '#666666',
      '--primary': '#333333',
      '--primary-foreground': '#ffffff',
      '--accent': '#999999',
    }
  },
  {
    name: 'Solo Leveling',
    id: 'solo-leveling',
    emoji: '🜃',
    description: 'Hunter-gold HUD with shadow mana accents',
    variables: {
      '--background': '#06060a',
      '--card-bg': '#0b0b13',
      '--border': 'rgba(215, 179, 106, 0.18)',
      '--text': '#f7f1e4',
      '--text-muted': 'rgba(247, 241, 228, 0.62)',
      '--primary': '#d7b36a',
      '--primary-foreground': '#06060a',
      '--accent': '#d7b36a',
    }
  },
]


export function getTheme(id: string): Theme {
  return themes.find(t => t.id === id) || themes[0]
}

export function applyTheme(themeId: string) {
  const theme = getTheme(themeId)
  const root = document.documentElement
  
  Object.entries(theme.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  
  localStorage.setItem('adversity-theme', themeId)
}

export function initTheme() {
  const saved = localStorage.getItem('adversity-theme')
  if (saved) {
    applyTheme(saved)
  }
}
