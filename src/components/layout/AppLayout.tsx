import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { MobileSidebar } from './MobileSidebar'
import { Breadcrumbs } from './Breadcrumbs'

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--bg-muted))]">
      <AppSidebar collapsed={sidebarCollapsed} />
      <MobileSidebar />
      <div className={sidebarCollapsed ? 'flex flex-1 flex-col md:pl-16' : 'flex flex-1 flex-col md:pl-64'}>
        <AppHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapsed={() => setSidebarCollapsed((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <Breadcrumbs />
          <div className="mt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
