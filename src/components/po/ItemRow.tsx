import { useState } from 'react'
import type { ProductUtilityRecord, PurchaseOrderLineItem } from '../../types/po'
import type { ItemTableColumnKey } from '../../types/po'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'
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
  products?: ProductUtilityRecord[]
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
  products,
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

  const selectedProduct =
    products?.find((p) => String(p.sku).trim() === String(item.sku).trim()) ??
    products?.find((p) => String(p.productName).trim().toLowerCase() === String(item.productName).trim().toLowerCase()) ??
    null

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
            <select
              className="min-w-[220px] w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              value={selectedProduct?.productId ?? ''}
              onChange={(e) => {
                const id = e.target.value
                const p = products?.find((x) => x.productId === id)
                if (!p) return
                onUpdate(item.id, {
                  productId: p.productId ?? '',
                  productName: p.productName ?? '',
                  sku: p.sku ?? '',
                  description: p.description ?? '',
                  quantity: typeof p.minOrderPallet === 'number' ? p.minOrderPallet : 0,
                })
              }}
            >
              <option value="" disabled>
                Select product...
              </option>
              {(products ?? []).map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productSize ? `${p.productName} - ${p.productSize}` : p.productName}
                </option>
              ))}
            </select>
          )}
        </TableCell>
      )}
      {visibleColumns.has('sku') && (
        <TableCell>
          {readOnly ? (
            item.sku
          ) : (
            <Input
              value={item.sku}
              onChange={(e) => onUpdate(item.id, { sku: e.target.value })}
              placeholder="SKU"
              className="min-w-[120px]"
            />
          )}
        </TableCell>
      )}
      {visibleColumns.has('description') && (
        <TableCell>
          {readOnly ? (
            item.description
          ) : (
            <Textarea
              value={item.description}
              onChange={(e) => onUpdate(item.id, { description: e.target.value })}
              placeholder="Description"
              className="min-w-[220px] min-h-[44px] max-h-[120px]"
              rows={2}
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
