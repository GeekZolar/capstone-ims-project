import { create } from 'zustand'

interface UiState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  mfaEnabled: boolean
  userAvatar: string | null
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setSidebarOpen: (open: boolean) => void
  setMfaEnabled: (enabled: boolean) => void
  setUserAvatar: (avatar: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  mfaEnabled: localStorage.getItem('ims_mfa_enabled') === 'true',
  userAvatar: localStorage.getItem('ims_user_avatar'),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
  setTheme: (theme) => set(() => ({ theme })),
  setSidebarOpen: (open) => set(() => ({ sidebarOpen: open })),
  setMfaEnabled: (enabled) =>
    set(() => {
      localStorage.setItem('ims_mfa_enabled', String(enabled))
      return { mfaEnabled: enabled }
    }),
  setUserAvatar: (avatar) =>
    set(() => {
      if (avatar) {
        localStorage.setItem('ims_user_avatar', avatar)
      } else {
        localStorage.removeItem('ims_user_avatar')
      }
      return { userAvatar: avatar }
    }),
}))
