import { create } from 'zustand'
import type { NumberTrackingResult } from '../types/api'

interface AppState {
  sidebarOpen: boolean
  recentResult: NumberTrackingResult | null
  toggleSidebar: () => void
  setRecentResult: (result: NumberTrackingResult) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  recentResult: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setRecentResult: (recentResult) => set({ recentResult }),
}))
