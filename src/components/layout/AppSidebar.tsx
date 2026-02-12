import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { navigation } from '../../config/navigation'
import clsx from 'clsx'
import { useAuthStore } from '../../store/authStore'

export const AppSidebar = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-6 md:fixed md:inset-y-0 md:left-0 md:flex">
      <div className="mb-8 flex flex-col items-center gap-3">
        <img
          src="/assets/img/S&R_logo.png"
          alt="S&R Foods logo"
          className="h-20 w-20 rounded-xl bg-white object-contain"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            S&R Foods <span className="text-slate-900 font-bold">IMS</span>
          </p>
          {/* <h2 className="text-lg font-semibold text-[rgb(var(--text))]">IMS</h2> */}
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100',
                  isActive && 'bg-slate-100 text-slate-900',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
      <div className="rounded-xl bg-[rgb(var(--bg-muted))] p-4 text-xs text-[rgb(var(--muted))]">
        <p className="font-semibold text-[rgb(var(--text))]">Sync status</p>
        <p className="mt-2">QuickBooks: Healthy</p>
        <p>WMS: Healthy</p>
        <p>Sales Channels: Degraded</p>
      </div>
    </aside>
  )
}
