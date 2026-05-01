'use client'

import { useState } from 'react'
import { getFaviconUrl } from '@/components/widgets/SiteButtons/useSites'
import type { SiteEntry } from '@/components/widgets/SiteButtons/useSites'

interface SiteButtonProps {
  site: SiteEntry
}

export default function SiteButton({ site }: SiteButtonProps) {
  const [imgError, setImgError] = useState(false)
  const faviconUrl = getFaviconUrl(site.url)

  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="site-button flex flex-col items-center gap-1 p-3 rounded-lg border border-[#00d4ff22] bg-[#0B0B0C] hover:border-[#00d4ff] hover:scale-105 transition-all duration-200"
      title={site.name}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        {!imgError && faviconUrl ? (
          <img
            src={faviconUrl}
            alt={site.name}
            className="w-8 h-8"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center border border-[#00d4ff] rounded bg-black text-[#00d4ff] text-sm font-bold">
            {site.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-[10px] text-[#00d4ff88] font-mono truncate w-full text-center">
        {site.name}
      </span>
    </a>
  )
}
