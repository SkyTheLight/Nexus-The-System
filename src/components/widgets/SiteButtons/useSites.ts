import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { SiteConfig } from '@/lib/sites'
import { defaultSites } from '@/lib/sites'

export interface SiteEntry extends SiteConfig {
  user_site_id?: string // for user-added sites
}

export function useSites() {
  const [sites, setSites] = useState<SiteEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadSites = useCallback(async () => {
    setLoading(true)
    try {
      // Load user site order from localStorage
      const savedOrder = localStorage.getItem('site-buttons-order')
      let orderedIds: string[] = savedOrder ? JSON.parse(savedOrder) : []

      // Merge: start with defaults, add user sites
      const supabase = getSupabase()
      let userSites: SiteEntry[] = []

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('user_sites')
            .select('id, name, url, created_at')
            .order('created_at', { ascending: true })

          if (!error && data) {
            userSites = data.map(s => ({
              id: s.id,
              name: s.name,
              url: s.url,
              user_site_id: s.id
            }))
          }
        } catch {
          // supabase not available, continue with defaults
        }
      }

      // Combine default + user sites
      const allSites = [...defaultSites, ...userSites]

      // Sort by saved order
      if (orderedIds.length > 0) {
        const siteMap = new Map(allSites.map(s => [s.id, s]))
        const ordered = orderedIds.map(id => siteMap.get(id)).filter(Boolean) as SiteEntry[]
        const unordered = allSites.filter(s => !orderedIds.includes(s.id))
        setSites([...ordered, ...unordered])
      } else {
        setSites(allSites)
      }
    } catch (e) {
      console.error('Failed to load sites:', e)
      setSites(defaultSites)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSites()
  }, [loadSites])

  const saveOrder = useCallback((newSites: SiteEntry[]) => {
    setSites(newSites)
    const ids = newSites.map(s => s.id)
    localStorage.setItem('site-buttons-order', JSON.stringify(ids))

    // Save to Supabase if available
    const supabase = getSupabase()
    if (supabase) {
      supabase
        .from('user_site_order')
        .upsert({
          site_ids: ids,
          updated_at: new Date().toISOString()
        })
        .then(() => {})
        .catch(() => {})
    }
  }, [])

  const addSite = useCallback(async (name: string, url: string) => {
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_sites')
          .insert({ name, url })
          .select()
          .single()

        if (!error && data) {
          const newSite: SiteEntry = {
            id: data.id,
            name: data.name,
            url: data.url,
            user_site_id: data.id
          }
          const newSites = [...sites, newSite]
          saveOrder(newSites)
        }
      } catch {
        // fallback: add locally
        const newSite: SiteEntry = {
          id: `local-${Date.now()}`,
          name,
          url
        }
        saveOrder([...sites, newSite])
      }
    } else {
      // no supabase, add locally
      const newSite: SiteEntry = {
        id: `local-${Date.now()}`,
        name,
        url
      }
      saveOrder([...sites, newSite])
    }
  }, [sites, saveOrder])

  return { sites, loading, saveOrder, addSite, refetch: loadSites }
}

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return ''
  }
}
