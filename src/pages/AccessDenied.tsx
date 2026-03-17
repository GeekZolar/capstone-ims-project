import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export const AccessDenied = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
    <h1 className="text-3xl font-semibold text-slate-900">Access denied</h1>
    <p className="max-w-md text-sm text-slate-500">
      You don&apos;t have permission to view this page. If you think this is a mistake, contact an
      administrator.
    </p>
    <Link to="/dashboard">
      <Button>Back to dashboard</Button>
    </Link>
  </div>
)

