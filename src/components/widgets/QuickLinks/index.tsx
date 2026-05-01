function getFavicon(url: string) {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return null
  }
}

export default function QuickLinksWidget() {
  const links = [
    { name: 'Discord', url: 'https://discord.com/app' },
    { name: 'Spotify', url: 'https://open.spotify.com' },
    { name: 'Molkit', url: 'https://molkit-prod.vercel.app/' },
    { name: 'AI Humanize', url: 'https://aihumanize.io/' }
  ]

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium">Quick Links</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {links.map(site => {
          const favicon = getFavicon(site.url)
          return (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-xl bg-[#111113] border border-white/10 transition-all duration-300 hover:bg-white/5 hover:scale-105"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {favicon ? (
                  <img src={favicon} alt={site.name} className="w-5 h-5" />
                ) : (
                  <div className="w-5 h-5 bg-white/10 rounded" />
                )}
              </div>
              <span className="text-xs font-medium text-white/90">{site.name}</span>
              <svg className="w-3 h-3 ml-auto text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          )
        })}
      </div>
    </div>
  )
}
  ]

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium">Quick Links</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {links.map(site => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${site.color} ${site.bgHover} border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="text-white">
              {site.logo}
            </div>
            <span className="text-xs font-medium text-white/90">{site.name}</span>
            <svg className="w-3 h-3 ml-auto text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
