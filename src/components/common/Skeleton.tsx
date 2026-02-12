import clsx from 'clsx'

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={clsx('animate-pulse rounded-lg bg-slate-100', className)} />
)
