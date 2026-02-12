import type { ReactNode } from 'react'
import { Card } from './Card'

export const KpiCard = ({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string
  helper?: string
  icon?: ReactNode
}) => (
  <Card className="flex items-center gap-4">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--bg-muted))] text-[rgb(var(--muted))]">
      {icon}
    </div>
    <div>
      <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">{label}</p>
      <p className="text-xl font-semibold text-[rgb(var(--text))]">{value}</p>
      {helper && <p className="text-xs text-[rgb(var(--muted))]">{helper}</p>}
    </div>
  </Card>
)
