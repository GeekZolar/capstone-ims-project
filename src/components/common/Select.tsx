import clsx from 'clsx'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = ({ label, error, className, children, ...props }: SelectProps) => (
  <label className="flex flex-col gap-1 text-sm">
    {label && <span className="font-medium text-[rgb(var(--text))]">{label}</span>}
    <select
      className={clsx(
        'w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200',
        error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
)
