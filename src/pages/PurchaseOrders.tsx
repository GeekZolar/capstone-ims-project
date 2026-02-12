import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { StatusPill } from '../components/common/StatusPill'
import { Table, TableCell, TableHeader, TableRow } from '../components/common/Table'
import { usePurchaseOrders, useWarehouses } from '../hooks/useImsQueries'
import { formatCurrency, formatDate } from '../utils/format'

const statusMap = {
  draft: { label: 'Draft', variant: 'info' },
  approved: { label: 'Approved', variant: 'success' },
  sent: { label: 'Sent', variant: 'warning' },
  partially_received: { label: 'Partially Received', variant: 'warning' },
  received: { label: 'Received', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
} as const

export const PurchaseOrders = () => {
  const poQuery = usePurchaseOrders()
  const warehousesQuery = useWarehouses()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Create, approve, and track supplier purchase orders."
        actions={<Button>New PO</Button>}
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <div>
          <p className="font-semibold text-slate-900">Approval queue</p>
          <p>3 POs awaiting approval from KS or MO.</p>
        </div>
        <Button variant="secondary">View approval queue</Button>
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
              </TableRow>
            </TableHeader>
            <tbody>
              {poQuery.data?.map((po) => {
                const status = statusMap[po.status]
                const warehouse = warehousesQuery.data?.find((wh) => wh.id === po.warehouseId)
                return (
                  <TableRow key={po.id}>
                    <TableCell className="font-semibold text-slate-900">{po.poNumber}</TableCell>
                    <TableCell>{po.supplier}</TableCell>
                    <TableCell>{warehouse?.name ?? 'Unknown'}</TableCell>
                    <TableCell>
                      <StatusPill label={status.label} variant={status.variant} />
                    </TableCell>
                    <TableCell>{formatDate(po.orderDate)}</TableCell>
                    <TableCell>{formatDate(po.expectedDeliveryDate)}</TableCell>
                    <TableCell>{formatCurrency(po.totalValue, po.currency)}</TableCell>
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
