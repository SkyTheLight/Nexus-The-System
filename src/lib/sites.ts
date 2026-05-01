export interface SiteConfig {
  id: string
  name: string
  url: string
  color?: string
}

export const defaultSites: SiteConfig[] = [
  { id: 'google', name: 'Google', url: 'https://google.com' },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com' },
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com' },
  { id: 'github', name: 'GitHub', url: 'https://github.com' },
  { id: 'canvas', name: 'Canvas', url: 'https://ciit.instructure.com' },
  { id: 'spotify', name: 'Spotify', url: 'https://spotify.com' },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com' },
  { id: 'notion', name: 'Notion', url: 'https://notion.so' },
  { id: 'reddit', name: 'Reddit', url: 'https://reddit.com' },
  { id: 'discord', name: 'Discord', url: 'https://discord.com' },
  { id: 'facebook', name: 'Facebook', url: 'https://facebook.com' },
  { id: 'x', name: 'X', url: 'https://x.com' }
]
