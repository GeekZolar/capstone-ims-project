import clsx from 'clsx'

export const StatusPill = ({ label, variant }: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
      variant === 'success' && 'bg-emerald-100 text-emerald-700',
      variant === 'warning' && 'bg-amber-100 text-amber-700',
      variant === 'danger' && 'bg-rose-100 text-rose-700',
      variant === 'info' && 'bg-sky-100 text-sky-700',
    )}
  >
    {label}
  </span>
)
