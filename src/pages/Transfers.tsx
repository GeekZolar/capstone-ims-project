import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { StatusPill } from '../components/common/StatusPill'
import { Table, TableCell, TableHeader, TableRow } from '../components/common/Table'
import { useTransfers, useWarehouses } from '../hooks/useImsQueries'
import { formatDate } from '../utils/format'

const statusMap = {
  pending: { label: 'Pending', variant: 'warning' },
  in_transit: { label: 'In Transit', variant: 'info' },
  received: { label: 'Received', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
} as const

export const Transfers = () => {
  const transfersQuery = useTransfers()
  const warehousesQuery = useWarehouses()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfers"
        description="Monitor inter-warehouse transfers and inbound receipts."
        actions={<Button>Create transfer</Button>}
      />

      <Card className="text-sm text-slate-600">
        Keep transfers updated to maintain accurate inventory visibility across regions.
      </Card>

      {transfersQuery.isLoading ? (
        <Skeleton className="h-64" />
      ) : transfersQuery.isError ? (
        <ErrorState
          title="Transfers unavailable"
          description="Please try again."
          onRetry={() => transfersQuery.refetch()}
        />
      ) : transfersQuery.data?.length === 0 ? (
        <EmptyState
          title="No transfers"
          description="Create a transfer to move stock between warehouses."
        />
      ) : (
        <Table>
          <table className="w-full text-left">
            <TableHeader>
              <TableRow>
                <TableCell className="text-xs font-semibold text-slate-500">Transfer</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Source</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Destination</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Status</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Created</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">ETA</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {transfersQuery.data?.map((transfer) => {
                const status = statusMap[transfer.status]
                const source = warehousesQuery.data?.find(
                  (wh) => wh.id === transfer.sourceWarehouseId,
                )
                const destination = warehousesQuery.data?.find(
                  (wh) => wh.id === transfer.destinationWarehouseId,
                )
                return (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-semibold text-slate-900">
                      {transfer.transferNumber}
                    </TableCell>
                    <TableCell>{source?.name ?? 'Unknown'}</TableCell>
                    <TableCell>{destination?.name ?? 'Unknown'}</TableCell>
                    <TableCell>
                      <StatusPill label={status.label} variant={status.variant} />
                    </TableCell>
                    <TableCell>{formatDate(transfer.createdDate)}</TableCell>
                    <TableCell>{formatDate(transfer.expectedArrivalDate)}</TableCell>
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
