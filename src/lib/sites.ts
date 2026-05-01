export interface SiteConfig {
  id: string
  name: string
  url: string
  color?: string
}

export type SiteCategory = 'ai' | 'school' | 'social' | 'dev' | 'all'

export interface SiteConfig {
  id: string
  name: string
  url: string
  color?: string
  category: SiteCategory
}

export const defaultSites: SiteConfig[] = [
  // AI Tools
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com', category: 'ai' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', category: 'ai' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', category: 'ai' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai', category: 'ai' },
  { id: 'grok', name: 'Grok', url: 'https://grok.com', category: 'ai' },
  { id: 'suno', name: 'Suno', url: 'https://suno.com', category: 'ai' },
  { id: 'midjourney', name: 'Midjourney', url: 'https://midjourney.com', category: 'ai' },
  { id: 'v0', name: 'v0', url: 'https://v0.dev', category: 'ai' },
  { id: 'cursor', name: 'Cursor', url: 'https://cursor.com', category: 'ai' },
  { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co', category: 'ai' },
  { id: 'bolt', name: 'Bolt', url: 'https://bolt.new', category: 'ai' },
  { id: 'lovable', name: 'Lovable', url: 'https://lovable.dev', category: 'ai' },
  // School
  { id: 'canvas', name: 'Canvas', url: 'https://ciit.instructure.com', category: 'school' },
  // Social
  { id: 'discord', name: 'Discord', url: 'https://discord.com', category: 'social' },
  { id: 'reddit', name: 'Reddit', url: 'https://reddit.com', category: 'social' },
  { id: 'facebook', name: 'Facebook', url: 'https://facebook.com', category: 'social' },
  { id: 'x', name: 'X', url: 'https://x.com', category: 'social' },
  // Dev
  { id: 'github', name: 'GitHub', url: 'https://github.com', category: 'dev' },
  { id: 'notion', name: 'Notion', url: 'https://notion.so', category: 'dev' },
  // General
  { id: 'google', name: 'Google', url: 'https://google.com', category: 'all' },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', category: 'all' },
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com', category: 'all' },
  { id: 'spotify', name: 'Spotify', url: 'https://spotify.com', category: 'all' },
]
