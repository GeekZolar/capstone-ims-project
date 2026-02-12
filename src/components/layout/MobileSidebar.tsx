import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { navigation } from '../../config/navigation'
import { useUiStore } from '../../store/uiStore'

export const MobileSidebar = () => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen)

  if (!sidebarOpen) return null

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute left-0 top-0 h-full w-72 bg-[rgb(var(--card))] px-4 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">S&R Foods</p>
            <h2 className="text-lg font-semibold text-slate-900">Inventory IMS</h2>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border))] text-[rgb(var(--muted))]"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
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
      </div>
    </div>
  )
}
