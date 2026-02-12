import { useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { ThemeToggle } from '../common/ThemeToggle'

export const AppHeader = () => {
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen)
  const userAvatar = useUiStore((state) => state.userAvatar)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavigate = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-[rgb(var(--bg))]/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--muted))] md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--muted))] md:flex">
          <Search className="h-4 w-4" />
          <span>Search SKUs, POs, transfers...</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--muted))]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <ThemeToggle />
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-1"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="User profile"
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-slate-200" aria-hidden />
            )}
            <div className="hidden text-xs md:block">
              <p className="font-semibold text-[rgb(var(--text))]">{user?.name ?? 'User'}</p>
              <p className="text-[11px] text-[rgb(var(--muted))]">{user?.role ?? 'role'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[rgb(var(--muted))]" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 shadow-lg"
              role="menu"
            >
              <button
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-muted))]"
                onClick={() => handleNavigate('/settings')}
                role="menuitem"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
