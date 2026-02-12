import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../../types/ims'

const roleWeight: Record<UserRole, number> = {
  system_admin: 5,
  po_approver: 4,
  po_creator: 3,
  forecast_editor: 3,
  inventory_manager: 2,
  read_only: 1,
}

export const RequireRole = ({ minRole }: { minRole: UserRole }) => {
  const user = useAuthStore((state) => state.user)
  const allowed = user && roleWeight[user.role] >= roleWeight[minRole]

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
