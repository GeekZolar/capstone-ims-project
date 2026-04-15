import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { StatusPill } from '../components/common/StatusPill'
import { Table, TableCell, TableHeader, TableRow } from '../components/common/Table'
import { purchaseOrderQueryKey, usePurchaseOrdersList } from '../hooks/usePoQueries'
import { formatCurrency, formatDate } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const statusMap: Record<
  string,
  { label: string; variant: 'info' | 'success' | 'warning' | 'danger' }
> = {
  draft: { label: 'Draft', variant: 'info' },
  approved: { label: 'Approved', variant: 'success' },
  sent: { label: 'Sent', variant: 'warning' },
  partially_received: { label: 'Partially Received', variant: 'warning' },
  received: { label: 'Received', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  rejected: { label: 'Rejected', variant: 'danger' },
  pending: { label: 'Pending', variant: 'warning' },
}

function statusDisplay(status: string) {
  const key = status.trim().toLowerCase().replace(/[\s-]+/g, '_')
  return statusMap[key] ?? { label: status || '—', variant: 'info' as const }
}

export const PurchaseOrders = () => {
  const poQuery = usePurchaseOrdersList()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const draftCount = useMemo(() => {
    const rows = poQuery.data ?? []
    return rows.filter((po) => po.status.trim().toLowerCase() === 'draft').length
  }, [poQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Create, approve, and track supplier purchase orders."
        actions={
          <Button onClick={() => navigate('/purchase-orders/new')}>
            Create New PO
          </Button>
        }
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <div>
          <p className="font-semibold text-slate-900">Approval queue</p>
          <p>
            {poQuery.isLoading
              ? 'Loading…'
              : `${draftCount} PO${draftCount === 1 ? '' : 's'} in draft awaiting approval.`}
          </p>
        </div>
        {/* <Button variant="secondary" type="button" onClick={() => navigate('/purchase-orders/new')}>
          Create PO
        </Button> */}
      </Card>

      {poQuery.isLoading ? (
        <Skeleton className="h-64" />
      ) : poQuery.isError ? (
        <ErrorState
          title="Purchase orders unavailable"
          description="Please try again."
          onRetry={() => poQuery.refetch()}
        />
      ) : poQuery.data?.length === 0 ? (
        <EmptyState
          title="No purchase orders"
          description="Create a purchase order to get started."
        />
      ) : (
        <Table>
          <table className="w-full text-left">
            <TableHeader>
              <TableRow>
                <TableCell className="text-xs font-semibold text-slate-500">PO</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Supplier</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Warehouse</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Status</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Order Date</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Expected</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Total</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {poQuery.data?.map((po) => {
                const status = statusDisplay(po.status)
                const supplierLabel = po.supplierName?.trim() || po.supplierId || '—'
                const warehouseLabel = po.warehouseName?.trim() || po.warehouseId || '—'
                return (
                  <TableRow key={po.id}>
                    <TableCell className="font-semibold text-slate-900">
                      {po.poNumber?.trim() || po.id}
                    </TableCell>
                    <TableCell>{supplierLabel}</TableCell>
                    <TableCell>{warehouseLabel}</TableCell>
                    <TableCell>
                      <StatusPill label={status.label} variant={status.variant} />
                    </TableCell>
                    <TableCell>{po.orderDate ? formatDate(po.orderDate) : '—'}</TableCell>
                    <TableCell>
                      {po.expectedDeliveryDate ? formatDate(po.expectedDeliveryDate) : '—'}
                    </TableCell>
                    <TableCell>{formatCurrency(po.totalValue, po.currency)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        type="button"
                        className="cursor-pointer rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                        onClick={() => {
                          if (po.detail) {
                            queryClient.setQueryData(purchaseOrderQueryKey(po.id), po.detail)
                          }
                          navigate(`/po/approve/${po.id}`)
                        }}
                      >
                        View detail
                      </Button>
                    </TableCell>
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
