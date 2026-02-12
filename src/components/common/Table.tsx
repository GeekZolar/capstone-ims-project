import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

export const Table = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      'overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm',
      className,
    )}
    {...props}
  />
)

export const TableHeader = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={clsx(
      'bg-[rgb(var(--bg-muted))] text-xs uppercase tracking-wide text-[rgb(var(--muted))]',
      className,
    )}
    {...props}
  />
)

export const TableRow = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={clsx('border-b border-slate-200 last:border-b-0', className)} {...props} />
)

export const TableCell = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <td className={clsx('px-4 py-3 text-sm text-[rgb(var(--text))]', className)} {...props} />
)
