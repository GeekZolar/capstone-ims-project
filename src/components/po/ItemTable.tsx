import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { utilityService } from '../../services/utilityService'

const DEFAULT_VISIBLE_COLUMNS: Set<ItemTableColumnKey> = new Set([
  'sku',
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
  supplierId?: string
  /** Filter products by backend countryCode (e.g. US, CA) from Location dropdown selection. */
  countryCode?: string | null
  /** When embedded in a page section that already has a heading. */
  showTitle?: boolean
  /** Show a bottom horizontal scrollbar on small screens. */
  mobileBottomScrollbar?: boolean
}

export function ItemTable({
  items,
  onChange,
  currency = 'USD',
  includeTax = false,
  taxRate = 0,
  readOnly,
  supplierId,
  countryCode,
  showTitle = true,
  mobileBottomScrollbar = false,
}: ItemTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<Set<ItemTableColumnKey>>(DEFAULT_VISIBLE_COLUMNS)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const bottomScrollRef = useRef<HTMLDivElement | null>(null)
  const bottomInnerRef = useRef<HTMLDivElement | null>(null)

  const productsQuery = useQuery({
    queryKey: ['po', 'utility-products'],
    queryFn: () => utilityService.getProducts(),
  })

  const products = useMemo(() => {
    const rows = productsQuery.data ?? []
    let filtered = rows.filter((p) => p.isActive !== false)
    if (countryCode) {
      filtered = filtered.filter((p) => String(p.countryCode).toUpperCase() === String(countryCode).toUpperCase())
    }
    if (supplierId) {
      filtered = filtered.filter((p) => String(p.supplierId) === String(supplierId))
    }
    return filtered
  }, [productsQuery.data, supplierId, countryCode])

  const productBySku = useMemo(() => {
    const map = new Map<string, (typeof products)[number]>()
    for (const p of products) {
      if (p.sku) map.set(String(p.sku).trim(), p)
    }
    return map
  }, [products])

  const productByName = useMemo(() => {
    const map = new Map<string, (typeof products)[number]>()
    for (const p of products) {
      if (p.productName) map.set(`${String(p.productName).trim().toLowerCase()}-${String(p.productSize?.toLowerCase() ?? '')}`, p)
    }
    return map
  }, [products])

  const updateItem = useCallback(
    (id: string, patch: Partial<PurchaseOrderLineItem>) => {
      onChange(
        items.map((it) => {
          if (it.id !== id) return it
          const next: PurchaseOrderLineItem = { ...it, ...patch }

          // Auto-bind product fields from backend utility/products.
          if (typeof patch.sku === 'string') {
            const sku = patch.sku.trim()
            const p = sku ? productBySku.get(sku) : undefined
            if (p) {
              next.productId = p.productId ?? next.productId
              next.productName = p.productName ?? next.productName
              next.description = (p.description ?? '') as string
            }
          }
          if (typeof patch.productName === 'string') {
            const key = patch.productName.trim().toLowerCase()
            const p = key ? productByName.get(key) : undefined
            if (p) {
              next.productId = p.productId ?? next.productId
              next.sku = p.sku ?? next.sku
              next.description = (p.description ?? '') as string
            }
          }
          if (typeof patch.quantity === 'number' || typeof patch.rate === 'number') {
            next.amount = computeLineAmount(next.quantity, next.rate)
          }
          return next
        }),
      )
    },
    [items, onChange, productByName, productBySku],
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

  useEffect(() => {
    if (!mobileBottomScrollbar) return
    const tableEl = tableScrollRef.current
    const bottomEl = bottomScrollRef.current
    const innerEl = bottomInnerRef.current
    if (!tableEl || !bottomEl || !innerEl) return

    const syncSize = () => {
      innerEl.style.width = `${tableEl.scrollWidth}px`
      bottomEl.scrollLeft = tableEl.scrollLeft
    }

    let ignore = 0
    const onTableScroll = () => {
      if (ignore === 2) {
        ignore = 0
        return
      }
      ignore = 1
      bottomEl.scrollLeft = tableEl.scrollLeft
    }
    const onBottomScroll = () => {
      if (ignore === 1) {
        ignore = 0
        return
      }
      ignore = 2
      tableEl.scrollLeft = bottomEl.scrollLeft
    }

    tableEl.addEventListener('scroll', onTableScroll, { passive: true })
    bottomEl.addEventListener('scroll', onBottomScroll, { passive: true })

    const ro = new ResizeObserver(syncSize)
    ro.observe(tableEl)
    syncSize()

    window.addEventListener('resize', syncSize, { passive: true })
    return () => {
      tableEl.removeEventListener('scroll', onTableScroll)
      bottomEl.removeEventListener('scroll', onBottomScroll)
      window.removeEventListener('resize', syncSize)
      ro.disconnect()
    }
  }, [items.length, mobileBottomScrollbar, visibleColumns])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {showTitle ? (
          <h3 className="text-sm font-semibold text-[rgb(var(--text))]">Item Details</h3>
        ) : (
          <div aria-hidden />
        )}
        <div className="flex flex-wrap items-center justify-start gap-1 sm:justify-end">
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

      <div ref={tableScrollRef} className="overflow-x-auto">
        <Table>
          <table className="w-full min-w-[980px] text-left">
            <TableHeader>
              <TableRow>
                {!readOnly && (
                  <TableCell className="w-8 text-xs font-semibold text-slate-500"></TableCell>
                )}
                <TableCell className="w-10 text-xs font-semibold text-slate-500">No.</TableCell>
                
                {visibleColumns.has('productName') && (
                  <TableCell className="text-xs font-semibold text-slate-500">Product Name</TableCell>
                )}
                {visibleColumns.has('sku') && (
                  <TableCell className="text-xs font-semibold text-slate-500">SKU</TableCell>
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
                  products={products}
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

      {mobileBottomScrollbar && (
        <div className="md:hidden">
          <div
            ref={bottomScrollRef}
            className="h-4 overflow-x-auto overflow-y-hidden rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))]"
            aria-hidden
          >
            <div ref={bottomInnerRef} className="h-4" />
          </div>
        </div>
      )}

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
