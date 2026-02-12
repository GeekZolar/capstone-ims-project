import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
    <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
    <p className="text-sm text-slate-500">The page you requested does not exist.</p>
    <Link to="/dashboard">
      <Button>Back to dashboard</Button>
    </Link>
  </div>
)
