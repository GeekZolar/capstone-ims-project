import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePurchaseOrder, useApprovePurchaseOrder, useRejectPurchaseOrder } from '../hooks/usePoQueries'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Textarea } from '../components/common/Textarea'
import { Skeleton } from '../components/common/Skeleton'
import { ErrorState } from '../components/common/ErrorState'
import { ItemTable } from '../components/po/ItemTable'
import { useToast } from '../components/common/Toast'
import { formatCurrency } from '../utils/format'

export const PurchaseOrderApproval = () => {
  const { poId } = useParams<{ poId: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()

  const poQuery = usePurchaseOrder(poId)
  const approveMutation = useApprovePurchaseOrder(poId ?? '')
  const rejectMutation = useRejectPurchaseOrder(poId ?? '')

  const isBusy = approveMutation.isPending || rejectMutation.isPending

  const currency = useMemo(() => {
    const d = poQuery.data
    if (!d) return 'USD' as const
    if (d.currency) return d.currency
    return d.location === 'CAN' ? ('CAD' as const) : ('USD' as const)
  }, [poQuery.data])

  const taxRateForTable = useMemo(() => {
    const d = poQuery.data
    if (!d) return 0
    if (d.taxRate != null && d.taxRate > 0) return d.taxRate
    if (d.subtotal > 0 && d.taxAmount != null) return d.taxAmount / d.subtotal
    return 0
  }, [poQuery.data])

  const handleApprove = async () => {
    if (!poId) return
    try {
      await approveMutation.mutateAsync()
      notify({ title: 'PO Approved', message: 'Purchase order has been approved.', variant: 'success' })
      navigate('/purchase-orders')
    } catch (e) {
      notify({
        title: 'Approval failed',
        message: e instanceof Error ? e.message : 'Something went wrong.',
        variant: 'error',
      })
    }
  }

  const handleReject = async () => {
    if (!poId) return
    try {
      await rejectMutation.mutateAsync({})
      notify({ title: 'PO Rejected', message: 'Purchase order has been rejected.', variant: 'success' })
      navigate('/purchase-orders')
    } catch (e) {
      notify({
        title: 'Rejection failed',
        message: e instanceof Error ? e.message : 'Something went wrong.',
        variant: 'error',
      })
    }
  }

  if (poQuery.isLoading || !poId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Purchase order detail" description="Loading…" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (poQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Purchase order detail" />
        <ErrorState
          title="Purchase order not found"
          description="This PO may have been removed or you may not have access."
          onRetry={() => poQuery.refetch()}
        />
      </div>
    )
  }

  const data = poQuery.data!
  const supplierLabel =
    data.supplier?.companyName ?? data.supplierName ?? data.supplierId ?? '—'
  const warehouseLabel =
    data.warehouse?.companyName ?? data.warehouseName ?? data.warehouseId ?? '—'
  const isApproved = String(data.status ?? '').trim().toLowerCase() === 'approved'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Purchase order${data.poNumber ? ` – ${data.poNumber}` : ''}`}
        description="Review this purchase order. Fields are read-only."
      />

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Supplier</h2>
        <Input label="Supplier" value={supplierLabel} readOnly />
        <div className="mt-4">
          <Textarea
            label="Supplier details"
            value={data.supplierDetails ?? ''}
            readOnly
            rows={4}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Dates</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="PO date" type="date" value={data.poDate} readOnly />
          <Input label="Due date" type="date" value={data.dueDate} readOnly />
          <Input label="Delivery date" type="date" value={data.deliveryDate} readOnly />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Location &amp; warehouse</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Location" value={data.location} readOnly />
          <Input label="Warehouse" value={warehouseLabel} readOnly />
          <div className="md:col-span-2">
            <Textarea
              label="Warehouse details"
              value={data.warehouseDetails ?? ''}
              readOnly
              rows={4}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Shipping</h2>
        <Input label="Shipping method" value={data.shippingMethod} readOnly />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Tax &amp; totals</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Include tax"
            value={data.includeTax ? 'Yes' : 'No'}
            readOnly
          />
          <Input
            label="Tax rate"
            value={data.taxRate != null ? `${(data.taxRate * 100).toFixed(1)}%` : '—'}
            readOnly
          />
          <Input label="Subtotal" value={formatCurrency(data.subtotal, currency)} readOnly />
          <Input
            label="Tax amount"
            value={data.taxAmount != null ? formatCurrency(data.taxAmount, currency) : '—'}
            readOnly
          />
          <Input
            label="Total"
            value={formatCurrency(data.totalAmount, currency)}
            readOnly
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Notes</h2>
        <Textarea label="PO notes" value={data.notes ?? ''} readOnly rows={4} />
      </Card>

      <Card className="p-6">
        <ItemTable
          items={data.items ?? []}
          onChange={() => {}}
          currency={currency}
          includeTax={data.includeTax}
          taxRate={taxRateForTable}
          readOnly
          showTitle
        />
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <Button variant="secondary" type="button" onClick={() => navigate('/purchase-orders')} disabled={isBusy}>
          Back to list
        </Button>
        {!isApproved && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="danger"
              onClick={handleReject}
              disabled={isBusy}
            >
              {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
            </Button>
            <Button type="button" onClick={handleApprove} disabled={isBusy}>
              {approveMutation.isPending ? 'Approving…' : 'Approve'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
