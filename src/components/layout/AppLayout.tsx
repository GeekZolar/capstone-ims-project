import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { MobileSidebar } from './MobileSidebar'
import { Breadcrumbs } from './Breadcrumbs'

export const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--bg-muted))]">
      <AppSidebar />
      <MobileSidebar />
      <div className="flex flex-1 flex-col md:pl-64">
        <AppHeader />
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
