import { useState } from 'react'
import type { ItemTableColumnKey } from '../../types/po'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

const COLUMN_LABELS: Record<ItemTableColumnKey, string> = {
  sku: 'SKU',
  productName: 'Product Name',
  description: 'Description',
  quantity: 'Quantity',
  rate: 'Rate',
  amount: 'Amount',
}

interface ColumnCustomizerProps {
  visibleColumns: Set<ItemTableColumnKey>
  onToggle: (key: ItemTableColumnKey) => void
  trigger: React.ReactNode
}

export function ColumnCustomizer({ visibleColumns, onToggle, trigger }: ColumnCustomizerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg-muted))] hover:text-[rgb(var(--text))]"
        title="Customize columns"
      >
        {trigger}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <Card className="absolute right-0 top-full z-50 mt-1 min-w-[220px] p-3 shadow-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              Show columns
            </p>
            <ul className="space-y-1.5">
              {(Object.keys(COLUMN_LABELS) as ItemTableColumnKey[]).map((key) => (
                <li key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`col-${key}`}
                    checked={visibleColumns.has(key)}
                    onChange={() => onToggle(key)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label
                    htmlFor={`col-${key}`}
                    className="cursor-pointer text-sm text-[rgb(var(--text))]"
                  >
                    {COLUMN_LABELS[key]}
                  </label>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </Card>
        </>
      )}
    </div>
  )
}
