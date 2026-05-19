import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'adversity-sidebar' }
  )
)
