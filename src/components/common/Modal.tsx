import type { ReactNode } from 'react'

export function Modal({
  open,
  title,
  children,
  onClose,
  actions,
}: {
  open: boolean
  title: string
  children?: ReactNode
  actions?: ReactNode
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="w-full max-w-md rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--border))] p-4">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-[rgb(var(--text))]">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-[rgb(var(--muted))] hover:bg-black/5"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="p-4 text-sm text-[rgb(var(--text))]">{children}</div>
          {actions && (
            <div className="flex items-center justify-end gap-2 border-t border-[rgb(var(--border))] p-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

