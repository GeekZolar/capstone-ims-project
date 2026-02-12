import clsx from 'clsx'

export const Badge = ({
  label,
  variant = 'default',
}: {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
      variant === 'default' && 'bg-slate-100 text-slate-600',
      variant === 'success' && 'bg-emerald-100 text-emerald-700',
      variant === 'warning' && 'bg-amber-100 text-amber-700',
      variant === 'danger' && 'bg-rose-100 text-rose-700',
      variant === 'info' && 'bg-sky-100 text-sky-700',
    )}
  >
    {label}
  </span>
)
