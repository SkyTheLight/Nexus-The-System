export default function SchoolLinksWidget() {
  const schoolSites = [
    {
      name: 'CIIT Canvas',
      url: 'https://ciit.instructure.com/',
      color: 'from-red-500 to-pink-600',
      bgHover: 'hover:from-red-500/20 hover:to-pink-600/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zM4 8.5l8 4v7.5l-8-4V8.5zm16 0v7.5l-8 4V12.5l8-4z"/>
        </svg>
      )
    }
  ]

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium">School Links</h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {schoolSites.map(site => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br ${site.color} ${site.bgHover} border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="text-white">
              {site.logo}
            </div>
            <span className="text-sm font-medium text-white/90">{site.name}</span>
            <svg className="w-4 h-4 ml-auto text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
