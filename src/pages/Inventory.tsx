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
import { useInventory, useWarehouses } from '../hooks/useImsQueries'
import { formatDate, formatNumber } from '../utils/format'

const statusMap = {
  available: { label: 'Available', variant: 'success' },
  damaged: { label: 'Damaged', variant: 'danger' },
  expired: { label: 'Expired', variant: 'warning' },
  quarantined: { label: 'Quarantined', variant: 'info' },
} as const

export const Inventory = () => {
  const inventoryQuery = useInventory()
  const warehousesQuery = useWarehouses()
  const [search, setSearch] = useState('')
  const [warehouseId, setWarehouseId] = useState('all')

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Search SKU availability, lot tracking, and expiry status by location."
        actions={<Button variant="secondary">New Adjustment</Button>}
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
    </div>
  )
}
