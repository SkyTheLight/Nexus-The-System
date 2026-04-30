export default function QuickLinksWidget() {
  const links = [
    {
      name: 'Discord',
      url: 'https://discord.com/app',
      color: 'from-indigo-500 to-purple-600',
      bgHover: 'hover:from-indigo-500/20 hover:to-purple-600/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.93 0 0 1 .132-.44 19.092 19.092 0 0 0-5.613 0 13.5 13.5 0 0 1 .132.44 14.2 14.2 0 0 1 3.995 2.23c1.685 1.16 3.206 2.775 3.906 4.717a19.09 19.09 0 0 1-5.855 2.026 13.2 13.2 0 0 1-3.916-.98c-.84-.27-1.68-.57-2.53-.95a1.1 1.1 0 0 1-.57-.94c0-.5.37-.88.87-.88.1 0 .2.02.3.04 1.53.52 3.04 1.05 4.53 1.05s3-.53 4.53-1.05c.1-.02.2-.04.3-.04.5 0 .87.38.87.88a1.1 1.1 0 0 1-.57.94c-.85.38-1.69.68-2.53.95a13.2 13.2 0 0 1-3.916.98 19.09 19.09 0 0 1-5.855-2.026c.7-1.942 2.221-3.557 3.906-4.717A14.2 14.2 0 0 1 20.317 4.37z"/>
        </svg>
      )
    },
    {
      name: 'Spotify',
      url: 'https://open.spotify.com',
      color: 'from-green-500 to-emerald-600',
      bgHover: 'hover:from-green-500/20 hover:to-emerald-600/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.531-1.221.531-.331 0-.745-.141-1.459-.852-.016-.017-.023-.036-.053-.055-.246-.211-.508-.44-.771-.66-.31-.25-.666-.494-1.059-.744-.684-.42-1.324-.825-1.866-1.359-.412-.479-.594-1.129-.594-1.949 0-1.56.775-2.748 2.078-3.229 1.051-.354 2.244-.536 3.598-.536 1.297 0 2.471.168 3.52.498.58.194 1.085.479 1.514.852.429.373.76.831.988 1.369.226.537.339 1.095.339 1.671 0 .34-.072.662-.186.959-.114.297-.285.547-.498.751-.213.205-.456.369-.729.493s-.569.21-.873.26c-.304.047-.618.071-.943.071-.331 0-.616-.041-.857-.123-.241-.082-.431-.178-.571-.29-.14-.112-.238-.244-.294-.398-.056-.154-.084-.325-.084-.513 0-.232.077-.434.231-.607.154-.173.381-.335.68-.486.299-.15.654-.296 1.066-.44.412-.143.85-.288 1.313-.435.463-.146.924-.306 1.382-.48.458-.173.886-.398 1.284-.677.398-.279.74-.636 1.025-1.07.286-.435.429-.981.429-1.638 0-.604-.109-1.141-.327-1.604-.218-.463-.504-.855-.857-1.175-.353-.32-.755-.569-1.205-.747C16.91 4.82 16.383 4.7 15.797 4.7c-.422 0-.81.04-1.164.12-.354.08-.66.191-.919.332-.259.141-.474.312-.645.513-.171.201-.296.416-.371.645-.075.229-.124.459-.124.689 0 .449.163.829.489 1.14.326.31.777.542 1.352.697.575.155 1.23.299 1.965.432.734.133 1.47.295 2.207.486.736.191 1.418.459 2.043.801.625.342 1.168.807 1.628 1.395.459.588.688 1.321.688 2.2 0 .947-.23 1.777-.689 2.488-.459.711-1.075 1.286-1.852 1.726-.777.44-1.673.77-2.688.99-.348.07-.68.126-1.004.172V17.34z"/>
        </svg>
      )
    },
    {
      name: 'Molkit',
      url: 'https://molkit-prod.vercel.app/',
      color: 'from-cyan-500 to-blue-600',
      bgHover: 'hover:from-cyan-500/20 hover:to-blue-600/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      )
    },
    {
      name: 'AI Humanize',
      url: 'https://aihumanize.io/',
      color: 'from-pink-500 to-rose-600',
      bgHover: 'hover:from-pink-500/20 hover:to-rose-600/20',
      logo: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7-4.5-7-4.5v9z"/>
        </svg>
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
