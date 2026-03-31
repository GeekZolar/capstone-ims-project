import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

/** Blocks app shell until the user completes a forced password change. */
export const RequireNoDefaultPassword = () => {
  const mustChangePassword = useAuthStore((state) => state.mustChangePassword)
  const location = useLocation()

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
