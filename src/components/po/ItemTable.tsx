import { useState, useCallback } from 'react'
import type { PurchaseOrderLineItem, ItemTableColumnKey } from '../../types/po'
import { createEmptyLineItem, computeLineAmount } from '../../services/poService'
import { Table, TableCell, TableHeader, TableRow } from '../common/Table'
import { Button } from '../common/Button'
import { formatCurrency } from '../../utils/format'
import { ColumnCustomizer } from './ColumnCustomizer'
import { ExportExcelButton } from './ExportExcelButton'
import { PasteItemButton } from './PasteItemButton'
import { ItemRow } from './ItemRow'
import { Settings } from 'lucide-react'

const DEFAULT_VISIBLE_COLUMNS: Set<ItemTableColumnKey> = new Set([
  'productName',
  'description',
  'quantity',
  'rate',
  'amount',
])

interface ItemTableProps {
  items: PurchaseOrderLineItem[]
  onChange: (items: PurchaseOrderLineItem[]) => void
  currency?: 'USD' | 'CAD'
  includeTax?: boolean
  taxRate?: number
  readOnly?: boolean
}

export function ItemTable({
  items,
  onChange,
  currency = 'USD',
  includeTax = false,
  taxRate = 0,
  readOnly,
}: ItemTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<Set<ItemTableColumnKey>>(DEFAULT_VISIBLE_COLUMNS)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const updateItem = useCallback(
    (id: string, patch: Partial<PurchaseOrderLineItem>) => {
      onChange(
        items.map((it) => {
          if (it.id !== id) return it
          const next = { ...it, ...patch }
          if (typeof patch.quantity === 'number' || typeof patch.rate === 'number') {
            next.amount = computeLineAmount(next.quantity, next.rate)
          }
          return next
        }),
      )
    },
    [items, onChange],
  )

  const addLine = useCallback(() => {
    onChange([...items, createEmptyLineItem()])
  }, [items, onChange])

  const deleteLine = useCallback(
    (id: string) => {
      onChange(items.filter((it) => it.id !== id))
    },
    [items, onChange],
  )

  const copyLine = useCallback(
    (item: PurchaseOrderLineItem) => {
      const copy = { ...createEmptyLineItem(), ...item, id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` }
      onChange([...items, copy])
    },
    [items, onChange],
  )

  const handlePaste = useCallback(
    (pasted: PurchaseOrderLineItem[]) => {
      onChange([...items, ...pasted])
    },
    [items, onChange],
  )

  const toggleColumn = useCallback((key: ItemTableColumnKey) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleDrop = useCallback(
    (dropIndex: number) => {
      if (draggedIndex == null || draggedIndex === dropIndex) {
        setDraggedIndex(null)
        return
      }
      const reordered = [...items]
      const [removed] = reordered.splice(draggedIndex, 1)
      reordered.splice(dropIndex, 0, removed)
      onChange(reordered)
      setDraggedIndex(null)
    },
    [draggedIndex, items, onChange],
  )

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.rate, 0)
  const taxAmount = includeTax ? Math.round(subtotal * taxRate * 100) / 100 : 0
  const total = subtotal + taxAmount

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[rgb(var(--text))]">Item Details</h3>
        <div className="flex items-center gap-1">
          <ExportExcelButton items={items} disabled={items.length === 0} />
          <PasteItemButton onPaste={handlePaste} disabled={readOnly} />
          <ColumnCustomizer
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
            trigger={<Settings className="h-5 w-5" />}
          />
          {!readOnly && (
            <Button type="button" variant="secondary" onClick={addLine}>
              Add Line
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <table className="w-full text-left">
            <TableHeader>
              <TableRow>
                {!readOnly && (
                  <TableCell className="w-8 text-xs font-semibold text-slate-500"></TableCell>
                )}
                <TableCell className="w-10 text-xs font-semibold text-slate-500">No.</TableCell>
                {visibleColumns.has('productName') && (
                  <TableCell className="text-xs font-semibold text-slate-500">Product Name</TableCell>
                )}
                {visibleColumns.has('description') && (
                  <TableCell className="text-xs font-semibold text-slate-500">Description</TableCell>
                )}
                {visibleColumns.has('quantity') && (
                  <TableCell className="text-xs font-semibold text-slate-500">Quantity</TableCell>
                )}
                {visibleColumns.has('rate') && (
                  <TableCell className="text-xs font-semibold text-slate-500">Rate</TableCell>
                )}
                {visibleColumns.has('amount') && (
                  <TableCell className="text-xs font-semibold text-slate-500">Amount</TableCell>
                )}
                {!readOnly && (
                  <TableCell className="w-12 text-xs font-semibold text-slate-500"></TableCell>
                )}
              </TableRow>
            </TableHeader>
            <tbody>
              {items.map((item, index) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  visibleColumns={visibleColumns}
                  currency={currency}
                  onUpdate={updateItem}
                  onCopy={copyLine}
                  onDelete={deleteLine}
                  onDragStart={handleDragStart}
                  onDragOver={() => {}}
                  onDrop={handleDrop}
                  isDragging={draggedIndex === index}
                  readOnly={readOnly}
                />
              ))}
            </tbody>
          </table>
        </Table>
      </div>

      <div className="flex justify-end">
        <dl className="w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="font-medium">{formatCurrency(subtotal, currency)}</dd>
          </div>
          {includeTax && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Tax</dt>
              <dd className="font-medium">{formatCurrency(taxAmount, currency)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <dt className="font-semibold text-slate-700">Total</dt>
            <dd className="font-semibold">{formatCurrency(total, currency)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
