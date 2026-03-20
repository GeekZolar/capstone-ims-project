import { useMemo, useState } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Select } from '../components/common/Select'
import { Skeleton } from '../components/common/Skeleton'
import { StatusPill } from '../components/common/StatusPill'
import { Table, TableCell, TableHeader, TableRow } from '../components/common/Table'
import { useInventory, useInventoryAdjustmentMutation, useWarehouses } from '../hooks/useImsQueries'
import { useToast } from '../components/common/Toast'
import { formatDate, formatNumber } from '../utils/format'

const statusMap = {
  available: { label: 'Available', variant: 'success' },
  damaged: { label: 'Damaged', variant: 'danger' },
  expired: { label: 'Expired', variant: 'warning' },
  quarantined: { label: 'Quarantined', variant: 'info' },
} as const

const uuidV4LikeRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const Inventory = () => {
  const inventoryQuery = useInventory()
  const warehousesQuery = useWarehouses()
  const adjustmentMutation = useInventoryAdjustmentMutation()
  const { notify } = useToast()
  const [search, setSearch] = useState('')
  const [warehouseId, setWarehouseId] = useState('all')
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [adjustSku, setAdjustSku] = useState('')
  const [adjustWarehouseId, setAdjustWarehouseId] = useState('')
  const [adjustQuantityDelta, setAdjustQuantityDelta] = useState(0)
  const [adjustReason, setAdjustReason] = useState<'cycle_count' | 'damage' | 'expiry' | 'other'>('other')
  const [adjustLotNumber, setAdjustLotNumber] = useState('')
  const [adjustExpiryDate, setAdjustExpiryDate] = useState('')

  const filtered = useMemo(() => {
    if (!inventoryQuery.data) return []
    return inventoryQuery.data.filter((item) => {
      const matchesSearch =
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase())
      const matchesWarehouse = warehouseId === 'all' || item.warehouseId === warehouseId
      return matchesSearch && matchesWarehouse
    })
  }, [inventoryQuery.data, search, warehouseId])

  const resetAdjustmentForm = () => {
    setAdjustSku('')
    setAdjustWarehouseId('')
    setAdjustQuantityDelta(0)
    setAdjustReason('other')
    setAdjustLotNumber('')
    setAdjustExpiryDate('')
  }

  const handleSubmitAdjustment = async () => {
    if (!adjustWarehouseId) {
      notify({ title: 'Missing warehouse', message: 'Select a warehouse for the adjustment.', variant: 'warning' })
      return
    }
    if (!uuidV4LikeRegex.test(adjustWarehouseId.trim())) {
      notify({
        title: 'Invalid warehouse ID',
        message: 'Enter a valid warehouse UUID from your backend data.',
        variant: 'warning',
      })
      return
    }
    if (adjustQuantityDelta === 0) {
      notify({ title: 'Invalid quantity', message: 'Quantity delta must be non-zero.', variant: 'warning' })
      return
    }
    try {
      await adjustmentMutation.mutateAsync({
        sku: adjustSku || undefined,
        warehouseId: adjustWarehouseId.trim(),
        quantityDelta: adjustQuantityDelta,
        reason: adjustReason,
        lotNumber: adjustLotNumber || undefined,
        expiryDate: adjustExpiryDate || undefined,
      })
      notify({ title: 'Adjustment submitted', message: 'Inventory adjustment created successfully.', variant: 'success' })
      setShowAdjustmentModal(false)
      resetAdjustmentForm()
    } catch (error) {
      notify({
        title: 'Adjustment failed',
        message: error instanceof Error ? error.message : 'Could not create inventory adjustment.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Search SKU availability, lot tracking, and expiry status by location."
        actions={
          <Button variant="secondary" onClick={() => setShowAdjustmentModal(true)}>
            New Adjustment
          </Button>
        }
      />

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_auto]">
          <Input
            label="Search"
            placeholder="Search by SKU or name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Warehouse"
            value={warehouseId}
            onChange={(event) => setWarehouseId(event.target.value)}
          >
            <option value="all">All locations</option>
            {warehousesQuery.data?.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button variant="primary">Export</Button>
          </div>
        </div>
      </Card>

      {inventoryQuery.isLoading ? (
        <Skeleton className="h-64" />
      ) : inventoryQuery.isError ? (
        <ErrorState
          title="Inventory unavailable"
          description="We could not load inventory data."
          onRetry={() => inventoryQuery.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No inventory results"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <Table>
          <table className="w-full text-left">
            <TableHeader>
              <TableRow>
                <TableCell className="text-xs font-semibold text-slate-500">SKU</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Description</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Warehouse</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Expiry</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Status</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Available</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Allocated</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">In Transit</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filtered.map((item) => {
                const warehouse = warehousesQuery.data?.find((wh) => wh.id === item.warehouseId)
                const status = statusMap[item.status]
                return (
                  <TableRow key={`${item.sku}-${item.lotNumber}`}>
                    <TableCell className="font-semibold text-slate-900">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{warehouse?.name ?? 'Unknown'}</TableCell>
                    <TableCell>{formatDate(item.expiryDate)}</TableCell>
                    <TableCell>
                      <StatusPill label={status.label} variant={status.variant} />
                    </TableCell>
                    <TableCell>{formatNumber(item.availableQty)}</TableCell>
                    <TableCell>{formatNumber(item.allocatedQty)}</TableCell>
                    <TableCell>{formatNumber(item.inTransitQty)}</TableCell>
                  </TableRow>
                )
              })}
            </tbody>
          </table>
        </Table>
      )}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Create inventory adjustment</h3>
            <p className="mt-1 text-sm text-slate-500">Post a quantity correction to `/inventory/adjust`.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input label="SKU (optional)" value={adjustSku} onChange={(event) => setAdjustSku(event.target.value)} />
              <Input
                label="Warehouse UUID"
                placeholder="e.g. 6f8f5f8f-1b2c-4d5e-8f90-123456789abc"
                value={adjustWarehouseId}
                onChange={(event) => setAdjustWarehouseId(event.target.value)}
              />
              <Input
                label="Quantity delta"
                type="number"
                value={adjustQuantityDelta}
                onChange={(event) => setAdjustQuantityDelta(Number(event.target.value))}
              />
              <Select
                label="Reason"
                value={adjustReason}
                onChange={(event) => setAdjustReason(event.target.value as 'cycle_count' | 'damage' | 'expiry' | 'other')}
              >
                <option value="cycle_count">Cycle count</option>
                <option value="damage">Damage</option>
                <option value="expiry">Expiry</option>
                <option value="other">Other</option>
              </Select>
              <Input
                label="Lot number (optional)"
                value={adjustLotNumber}
                onChange={(event) => setAdjustLotNumber(event.target.value)}
              />
              <Input
                label="Expiry date (optional)"
                type="date"
                value={adjustExpiryDate}
                onChange={(event) => setAdjustExpiryDate(event.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAdjustmentModal(false)
                  resetAdjustmentForm()
                }}
                disabled={adjustmentMutation.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitAdjustment} disabled={adjustmentMutation.isPending}>
                {adjustmentMutation.isPending ? 'Submitting...' : 'Submit adjustment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
