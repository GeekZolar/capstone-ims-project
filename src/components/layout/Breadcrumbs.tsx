import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { navigation } from '../../config/navigation'

const labelMap = new Map(navigation.map((item) => [item.path, item.label]))
labelMap.set('/login', 'Login')

export const Breadcrumbs = () => {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`
    return {
      path,
      label: labelMap.get(path) ?? segment.replace('-', ' '),
    }
  })

  if (!crumbs.length) return null

  return (
    <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <Link to="/dashboard" className="hover:text-slate-700">
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3" />
          <Link to={crumb.path} className="capitalize hover:text-slate-700">
            {crumb.label}
          </Link>
        </span>
      ))}
    </nav>
  )
}
