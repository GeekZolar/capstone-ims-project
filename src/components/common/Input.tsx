import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = ({ label, error, helperText, className, ...props }: InputProps) => (
  <label className="flex flex-col gap-1 text-sm">
    {label && <span className="font-medium text-[rgb(var(--text))]">{label}</span>}
    <input
      className={clsx(
        'w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200',
        error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200',
        className,
      )}
      {...props}
    />
    {helperText && !error && <span className="text-xs text-[rgb(var(--muted))]">{helperText}</span>}
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
)
