export default function AIWebsitesWidget() {
  const aiSites = [
    {
      name: 'ChatGPT',
      url: 'https://chat.openai.com',
      color: 'from-emerald-500 to-teal-600',
      bgHover: 'hover:from-emerald-500/20 hover:to-teal-600/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0038 6.0038 0 0 0-6.8417-2.9855 5.9582 5.9582 0 0 0-3.9201 1.0385 5.9582 5.9582 0 0 0-2.2858 1.5368 6.0038 6.0038 0 0 0 0 8.8715 5.9582 5.9582 0 0 0 2.2858 1.5368 5.9582 5.9582 0 0 0 3.9201 1.0385 6.0038 6.0038 0 0 0 6.8417-2.9855 5.9847 5.9847 0 0 0 .5157-4.9108zm-8.9034 2.3167c-.4448.4448-1.0998.6442-1.7678.6442s-1.323-.1994-1.7678-.6442l-2.2806-2.2806c-.4884-.4884-.4884-1.2798 0-1.7682s1.2798-.4884 1.7682 0l.5124.5124 1.7682 1.7682.5124-.5124c.4884-.4884 1.2798-.4884 1.7682 0s.4884 1.2798 0 1.7682l-2.2806 2.2806zm1.3188-6.2488c.1972.1972.1972.5166 0 .7138l-4.1044 4.1044c-.1972.1972-.5166.1972-.7138 0l-2.2806-2.2806c-.1972-.1972-.1972-.5166 0-.7138l.7124-.7124c.1972-.1972.5166-.1972.7138 0l1.2806 1.2806 3.3912-3.3912c.1972-.1972.5166-.1972.7138 0l.7124.7124z"/>
        </svg>
      )
    },
    {
      name: 'Gemini',
      url: 'https://gemini.google.com',
      color: 'from-blue-400 to-violet-500',
      bgHover: 'hover:from-blue-400/20 hover:to-violet-500/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      )
    },
    {
      name: 'Claude',
      url: 'https://claude.ai',
      color: 'from-orange-400 to-amber-500',
      bgHover: 'hover:from-orange-400/20 hover:to-amber-500/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
        </svg>
      )
    },
    {
      name: 'Groq',
      url: 'https://groq.com',
      color: 'from-purple-500 to-pink-600',
      bgHover: 'hover:from-purple-500/20 hover:to-pink-600/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      )
    },
    {
      name: 'Cursor',
      url: 'https://cursor.sh',
      color: 'from-blue-500 to-cyan-500',
      bgHover: 'hover:from-blue-500/20 hover:to-cyan-500/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M7 2l10 10-10 10V2zm2 3.5v9l6-4.5-6-4.5z"/>
        </svg>
      )
    },
    {
      name: 'Stability AI',
      url: 'https://stability.ai',
      color: 'from-violet-500 to-purple-600',
      bgHover: 'hover:from-violet-500/20 hover:to-purple-600/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      name: 'CodePen',
      url: 'https://codepen.io',
      color: 'from-gray-700 to-gray-900',
      bgHover: 'hover:from-gray-700/20 hover:to-gray-900/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M18.144 13.067v-2.134L16.55 9.95l-5.725 3.275v1.542l5.725 3.275 1.594-1.018v-2.134l-3.506-2.013 3.506-2.013zM8.769 9.95L3.856 13.067l-.001 2.134v.001l2.594 1.652 1.594-1.018V13.95l3.506-2.013-3.506-2.013V9.95zm0 4.1v1.634l-1.594.001v-1.635l1.594-.001z"/>
        </svg>
      )
    },
    {
      name: 'Replit',
      url: 'https://replit.com',
      color: 'from-orange-500 to-red-500',
      bgHover: 'hover:from-orange-500/20 hover:to-red-500/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M6.002 3.5L17.998 12 6.002 20.5v-17z"/>
        </svg>
      )
    }
  ]

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium">AI Websites</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {aiSites.map(site => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${site.color} ${site.bgHover} border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="text-white">
              {site.logo}
            </div>
            <span className="text-xs font-medium text-white/90">{site.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
