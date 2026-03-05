import clsx from 'clsx'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export const ErrorState = ({
  title,
  description,
  onRetry,
  compact = false,
}: {
  title: string
  description: string
  onRetry?: () => void
  compact?: boolean
}) => (
  <div
    className={clsx(
      'flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 text-rose-600',
      compact
        ? 'items-start px-3 py-3 text-left text-xs'
        : 'items-center px-6 py-10 text-center',
    )}
  >
    <AlertTriangle
      className={clsx('text-rose-500', compact ? 'h-4 w-4' : 'h-9 w-9')}
    />
    <div>
      <p className={clsx('font-semibold', compact ? 'text-xs' : 'text-sm')}>
        {title}
      </p>
      <p className="mt-1 text-xs text-rose-500">{description}</p>
    </div>
    {onRetry && (
      <Button
        variant="danger"
        onClick={onRetry}
        className={clsx(compact ? 'px-3 py-1 text-xs' : undefined)}
      >
        Retry
      </Button>
    )}
  </div>
)
