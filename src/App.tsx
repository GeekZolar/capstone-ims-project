import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RequireRole } from './components/auth/RequireRole'
import { Skeleton } from './components/common/Skeleton'

const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })))
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })),
)
const Inventory = lazy(() =>
  import('./pages/Inventory').then((m) => ({ default: m.Inventory })),
)
const Replenishment = lazy(() =>
  import('./pages/Replenishment').then((m) => ({ default: m.Replenishment })),
)
const PurchaseOrders = lazy(() =>
  import('./pages/PurchaseOrders').then((m) => ({ default: m.PurchaseOrders })),
)
const Transfers = lazy(() =>
  import('./pages/Transfers').then((m) => ({ default: m.Transfers })),
)
const Forecasts = lazy(() =>
  import('./pages/Forecasts').then((m) => ({ default: m.Forecasts })),
)
const Reports = lazy(() =>
  import('./pages/Reports').then((m) => ({ default: m.Reports })),
)
const Users = lazy(() => import('./pages/Users').then((m) => ({ default: m.Users })))
const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings })),
)
const NotFound = lazy(() =>
  import('./pages/NotFound').then((m) => ({ default: m.NotFound })),
)

function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[rgb(var(--bg-muted))] p-8">
          <Skeleton className="h-12 w-48" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`route-skeleton-${index}`} className="h-24" />
            ))}
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/replenishment" element={<Replenishment />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route element={<RequireRole minRole="forecast_editor" />}>
              <Route path="/forecasts" element={<Forecasts />} />
            </Route>
            <Route path="/reports" element={<Reports />} />
            <Route element={<RequireRole minRole="system_admin" />}>
              <Route path="/users" element={<Users />} />
            </Route>
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
