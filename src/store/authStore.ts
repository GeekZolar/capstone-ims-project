import { create } from 'zustand'
import type { UserProfile } from '../types/ims'

interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  login: (user: UserProfile, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) =>
    set(() => {
      sessionStorage.setItem('ims_token', token)
      sessionStorage.setItem('ims_user', JSON.stringify(user))
      return { user, token, isAuthenticated: true }
    }),
  logout: () =>
    set(() => {
      sessionStorage.removeItem('ims_token')
      sessionStorage.removeItem('ims_user')
      return { user: null, token: null, isAuthenticated: false }
    }),
}))

export const hydrateAuth = () => {
  const token = sessionStorage.getItem('ims_token')
  const userRaw = sessionStorage.getItem('ims_user')
  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw) as UserProfile
      useAuthStore.setState({ user, token, isAuthenticated: true })
    } catch {
      sessionStorage.removeItem('ims_token')
      sessionStorage.removeItem('ims_user')
    }
  }
}
