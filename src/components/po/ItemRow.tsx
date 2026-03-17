import { useState } from 'react'
import type { PurchaseOrderLineItem } from '../../types/po'
import type { ItemTableColumnKey } from '../../types/po'
import { Input } from '../common/Input'
import { TableCell, TableRow } from '../common/Table'
import { formatCurrency } from '../../utils/format'

interface ItemRowProps {
  item: PurchaseOrderLineItem
  index: number
  visibleColumns: Set<ItemTableColumnKey>
  currency: 'USD' | 'CAD'
  onUpdate: (id: string, patch: Partial<PurchaseOrderLineItem>) => void
  onCopy: (item: PurchaseOrderLineItem) => void
  onDelete: (id: string) => void
  onDragStart?: (index: number) => void
  onDragOver?: (index: number) => void
  onDrop?: (index: number) => void
  isDragging?: boolean
  readOnly?: boolean
}

export function ItemRow({
  item,
  index,
  visibleColumns,
  currency,
  onUpdate,
  onCopy,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  readOnly,
}: ItemRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const amount = item.quantity * item.rate

  const handleQuantityChange = (value: number) => {
    onUpdate(item.id, { quantity: value, amount: Math.round(value * item.rate * 100) / 100 })
  }
  const handleRateChange = (value: number) => {
    onUpdate(item.id, { rate: value, amount: Math.round(item.quantity * value * 100) / 100 })
  }

  return (
    <TableRow
      className={isDragging ? 'opacity-50 bg-slate-50' : ''}
      draggable={!readOnly && !!onDragStart}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(index))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart?.(index)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        onDragOver?.(index)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop?.(index)
      }}
    >
      {!readOnly && (
        <TableCell className="w-8 cursor-grab active:cursor-grabbing p-1 text-slate-400">
          <span
            draggable
            onDragStart={(e) => {
              e.stopPropagation()
              onDragStart?.(index)
            }}
            className="inline-block touch-none"
            title="Drag to reorder"
          >
            ⋮⋮
          </span>
        </TableCell>
      )}
      <TableCell className="w-10 text-slate-500">{index + 1}</TableCell>
      {visibleColumns.has('productName') && (
        <TableCell>
          {readOnly ? (
            item.productName
          ) : (
            <Input
              value={item.productName}
              onChange={(e) => onUpdate(item.id, { productName: e.target.value })}
              placeholder="Product name"
              className="min-w-[140px]"
            />
          )}
        </TableCell>
      )}
      {visibleColumns.has('description') && (
        <TableCell>
          {readOnly ? (
            item.description
          ) : (
            <Input
              value={item.description}
              onChange={(e) => onUpdate(item.id, { description: e.target.value })}
              placeholder="Description"
              className="min-w-[160px]"
            />
          )}
        </TableCell>
      )}
      {visibleColumns.has('quantity') && (
        <TableCell>
          {readOnly ? (
            item.quantity
          ) : (
            <Input
              type="number"
              min={0}
              step={1}
              value={item.quantity || ''}
              onChange={(e) => handleQuantityChange(Number(e.target.value) || 0)}
              className="w-24"
            />
          )}
        </TableCell>
      )}
      {visibleColumns.has('rate') && (
        <TableCell>
          {readOnly ? (
            formatCurrency(item.rate, currency)
          ) : (
            <Input
              type="number"
              min={0}
              step={0.01}
              value={item.rate || ''}
              onChange={(e) => handleRateChange(Number(e.target.value) || 0)}
              className="w-28"
            />
          )}
        </TableCell>
      )}
      {visibleColumns.has('amount') && (
        <TableCell className="font-medium">
          {formatCurrency(amount, currency)}
        </TableCell>
      )}
      {!readOnly && (
        <TableCell className="w-12 p-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 cursor-pointer"
              aria-label="Row actions"
            >
              ⋮
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  aria-hidden
                  onClick={() => setMenuOpen(false)}
                />
                <ul
                  className="absolute right-0 top-full z-40 mt-1 min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  role="menu"
                >
                  <li>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => {
                        onCopy(item)
                        setMenuOpen(false)
                      }}
                    >
                      Copy Line
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Edit Line
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                      onClick={() => {
                        onDelete(item.id)
                        setMenuOpen(false)
                      }}
                    >
                      Delete Line
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  )
}
