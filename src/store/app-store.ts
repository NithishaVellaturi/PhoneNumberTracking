import { create } from 'zustand'
import type { PhoneLookupResult } from '../types/api'

interface AppState {
  preferredCountryCode: string
  draftPhoneNumber: string
  latestLookup: PhoneLookupResult | null
  setPreferredCountryCode: (countryCode: string) => void
  setDraftPhoneNumber: (phoneNumber: string) => void
  setLatestLookup: (result: PhoneLookupResult | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  preferredCountryCode: 'US',
  draftPhoneNumber: '',
  latestLookup: null,
  setPreferredCountryCode: (preferredCountryCode) => set({ preferredCountryCode }),
  setDraftPhoneNumber: (draftPhoneNumber) => set({ draftPhoneNumber }),
  setLatestLookup: (latestLookup) => set({ latestLookup }),
}))
