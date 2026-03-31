import { create } from 'zustand'

interface UiState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  userAvatar: string | null
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setSidebarOpen: (open: boolean) => void
  setUserAvatar: (avatar: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  userAvatar: localStorage.getItem('ims_user_avatar'),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
  setTheme: (theme) => set(() => ({ theme })),
  setSidebarOpen: (open) => set(() => ({ sidebarOpen: open })),
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
