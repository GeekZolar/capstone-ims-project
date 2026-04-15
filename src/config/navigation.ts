import {
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  RefreshCcw,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '../types/ims'

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  minRole?: UserRole
}

export const navigation: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Replenishment', path: '/replenishment', icon: RefreshCcw },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
  { label: 'Transfers', path: '/transfers', icon: Truck },
  { label: 'Forecasts', path: '/forecasts', icon: BarChart3 },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Users', path: '/users', icon: Users, minRole: 'system_admin' },
  { label: 'Settings', path: '/settings', icon: Settings },
]
