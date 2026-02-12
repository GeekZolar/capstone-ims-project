import {
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  RefreshCcw,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react'

export const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Replenishment', path: '/replenishment', icon: RefreshCcw },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
  { label: 'Transfers', path: '/transfers', icon: Truck },
  { label: 'Forecasts', path: '/forecasts', icon: BarChart3 },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Settings', path: '/settings', icon: Settings },
]
