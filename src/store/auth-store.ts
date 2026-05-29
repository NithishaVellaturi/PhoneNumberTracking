import { create } from 'zustand'
import type { User } from '../types/api'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthState {
  user: User | null
  status: AuthStatus
  expiresAt: string | null
  setLoading: () => void
  setSession: (user: User, expiresAt: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  expiresAt: null,
  setLoading: () => set({ status: 'loading' }),
  setSession: (user, expiresAt) => set({ user, expiresAt, status: 'authenticated' }),
  clearSession: () => set({ user: null, expiresAt: null, status: 'anonymous' }),
}))
