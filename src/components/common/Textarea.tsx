import clsx from 'clsx'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = ({
  label,
  error,
  helperText,
  className,
  ...props
}: TextareaProps) => (
  <label className="flex flex-col gap-1 text-sm">
    {label && <span className="font-medium text-[rgb(var(--text))]">{label}</span>}
    <textarea
      className={clsx(
        'w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 min-h-[100px] resize-y',
        error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200',
        props.readOnly && 'bg-slate-50 text-slate-700',
        className,
      )}
      {...props}
    />
    {helperText && !error && <span className="text-xs text-[rgb(var(--muted))]">{helperText}</span>}
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
)
