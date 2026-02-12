import type { ReactNode } from 'react'

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) => (
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">{title}</h1>
      {description && <p className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
)
