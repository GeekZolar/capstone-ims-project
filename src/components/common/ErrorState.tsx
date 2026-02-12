import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export const ErrorState = ({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry?: () => void
}) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
    <AlertTriangle className="h-9 w-9 text-rose-500" />
    <div>
      <p className="text-sm font-semibold text-rose-600">{title}</p>
      <p className="mt-1 text-xs text-rose-500">{description}</p>
    </div>
    {onRetry && (
      <Button variant="danger" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
)
