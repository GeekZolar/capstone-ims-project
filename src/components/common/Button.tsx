import clsx from 'clsx'
import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed',
        variant === 'primary' &&
          'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90',
        variant === 'secondary' &&
          'border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-muted))]',
        variant === 'ghost' &&
          'text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg-muted))]',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-500',
        className,
      )}
      {...props}
    />
  )
}
