import { PackageSearch } from 'lucide-react'
import { Button } from './Button'

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--bg-muted))] px-6 py-10 text-center">
    <PackageSearch className="h-9 w-9 text-slate-400" />
    <div>
      <p className="text-sm font-semibold text-[rgb(var(--text))]">{title}</p>
      <p className="mt-1 text-xs text-[rgb(var(--muted))]">{description}</p>
    </div>
    {actionLabel && onAction && (
      <Button variant="secondary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
)
