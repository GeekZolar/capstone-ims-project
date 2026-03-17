import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  usePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useRequestChangesPurchaseOrder,
} from '../hooks/usePoQueries'
import { useSuppliers, useWarehousesByLocation } from '../hooks/usePoQueries'
import { formatSupplierDetails, formatWarehouseDetails } from '../services/poService'
import type { LocationCode, PurchaseOrderLineItem } from '../types/po'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'
import { Skeleton } from '../components/common/Skeleton'
import { ErrorState } from '../components/common/ErrorState'
import { SupplierDropdown } from '../components/po/SupplierDropdown'
import { WarehouseDropdown } from '../components/po/WarehouseDropdown'
import { ItemTable } from '../components/po/ItemTable'
import { useToast } from '../components/common/Toast'

export const PurchaseOrderApproval = () => {
  const { poId } = useParams<{ poId: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [editMode, setEditMode] = useState(false)

  const poQuery = usePurchaseOrder(poId)
  const approveMutation = useApprovePurchaseOrder(poId ?? '')
  const rejectMutation = useRejectPurchaseOrder(poId ?? '')
  const requestChangesMutation = useRequestChangesPurchaseOrder(poId ?? '')

  const [supplierId, setSupplierId] = useState('')
  const [poDate, setPoDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [location, setLocation] = useState<LocationCode | ''>('USA')
  const [warehouseId, setWarehouseId] = useState('')
  const [shippingMethod, setShippingMethod] = useState('')
  const [includeTax, setIncludeTax] = useState(true)
  const [taxRate, setTaxRate] = useState(0)
  const [items, setItems] = useState<PurchaseOrderLineItem[]>([])

  const suppliersQuery = useSuppliers()
  const warehousesQuery = useWarehousesByLocation(location || 'USA')

  const selectedSupplier = useMemo(
    () => suppliersQuery.data?.find((s) => s.id === supplierId) ?? null,
    [suppliersQuery.data, supplierId],
  )
  const selectedWarehouse = useMemo(
    () => warehousesQuery.data?.find((w) => w.id === warehouseId) ?? null,
    [warehousesQuery.data, warehouseId],
  )

  const supplierDetails = useMemo(
    () => formatSupplierDetails(selectedSupplier),
    [selectedSupplier],
  )
  const warehouseDetails = useMemo(
    () => formatWarehouseDetails(selectedWarehouse ?? undefined),
    [selectedWarehouse],
  )

  const initialSyncDone = useRef(false)
  useEffect(() => {
    const data = poQuery.data
    if (!data || initialSyncDone.current) return
    initialSyncDone.current = true
    setSupplierId(data.supplierId ?? '')
    setPoDate(data.poDate ?? '')
    setDueDate(data.dueDate ?? '')
    setDeliveryDate(data.deliveryDate ?? '')
    setLocation(data.location ?? 'USA')
    setWarehouseId(data.warehouseId ?? '')
    setShippingMethod(data.shippingMethod ?? '')
    setIncludeTax(data.includeTax ?? true)
    if (data.items?.length) setItems(data.items)

    const inferred =
      data.subtotal && data.taxAmount
        ? data.taxAmount / data.subtotal
        : 0
    setTaxRate(inferred || 0)
  }, [poQuery.data])

  const isBusy = approveMutation.isPending || rejectMutation.isPending || requestChangesMutation.isPending

  const handleApprove = async () => {
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

  const handleRequestChanges = async () => {
    try {
      await requestChangesMutation.mutateAsync({})
      notify({
        title: 'Changes requested',
        message: 'The requester has been notified.',
        variant: 'success',
      })
      navigate('/purchase-orders')
    } catch (e) {
      notify({
        title: 'Request failed',
        message: e instanceof Error ? e.message : 'Something went wrong.',
        variant: 'error',
      })
    }
  }

  if (poQuery.isLoading || !poId) {
    return (
      <div className="space-y-6">
        <PageHeader title="PO Approval" description="Loading…" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (poQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="PO Approval" />
        <ErrorState
          title="Purchase order not found"
          description="This PO may have been removed or you may not have access."
          onRetry={() => poQuery.refetch()}
        />
      </div>
    )
  }

  const data = poQuery.data!
  const readOnly = !editMode
  const currency = (data.location === 'CAN' ? 'CAD' : 'USD') as 'USD' | 'CAD'

  const displaySupplierId = supplierId || data.supplierId
  const displayWarehouseId = warehouseId || data.warehouseId
  const displayItems = items.length ? items : data.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Approve Purchase Order${data.poNumber ? ` – ${data.poNumber}` : ''}`}
        description="Review and approve, reject, or request changes for this purchase order."
        actions={
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={editMode}
              onChange={(e) => setEditMode(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-[rgb(var(--text))]">Enable Edit Mode</span>
          </label>
        }
      />

      <div className="space-y-6">
        {/* Section 1: Supplier */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">
            Supplier Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <SupplierDropdown
              suppliers={suppliersQuery.data}
              isLoading={suppliersQuery.isLoading}
              value={displaySupplierId}
              onChange={setSupplierId}
              disabled={readOnly}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Supplier Details"
                value={supplierDetails || data.supplierDetails || ''}
                readOnly
                rows={5}
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Dates */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">PO Dates</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="PO Date"
              type="date"
              value={poDate || data.poDate}
              onChange={(e) => setPoDate(e.target.value)}
              readOnly={readOnly}
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate || data.dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              readOnly={readOnly}
            />
            <Input
              label="Delivery Date"
              type="date"
              value={deliveryDate || data.deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              readOnly={readOnly}
            />
          </div>
        </Card>

        {/* Section 3: Location & Warehouse */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">
            Location &amp; Warehouse
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Location"
              value={location || data.location}
              onChange={(e) => {
                setLocation(e.target.value as LocationCode)
                setWarehouseId('')
              }}
              disabled={readOnly}
            >
              <option value="USA">USA</option>
              <option value="CAN">CAN</option>
            </Select>
            <WarehouseDropdown
              warehouses={warehousesQuery.data}
              isLoading={warehousesQuery.isLoading}
              value={displayWarehouseId}
              onChange={setWarehouseId}
              disabled={readOnly}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Warehouse Details"
                value={warehouseDetails || data.warehouseDetails || ''}
                readOnly
                rows={5}
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Shipping */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Shipping</h2>
          <Input
            label="Shipping Method"
            value={shippingMethod || data.shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
            readOnly={readOnly}
          />
        </Card>

        {/* Section 5: Tax */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Tax Option</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 max-w-xl">
            <div className="flex-1">
              <Select
                label="Tax"
                value={includeTax !== false ? 'true' : 'false'}
                onChange={(e) => setIncludeTax(e.target.value === 'true')}
                disabled={readOnly}
              >
                <option value="true">Include Tax</option>
                <option value="false">Exclude Tax</option>
              </Select>
            </div>

            {includeTax && (
              <div className="flex-1">
                <Select
                  label="Tax Percentage"
                  value={String(taxRate)}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  disabled={readOnly}
                >
                  <option value="0.05">5%</option>
                  <option value="0.1">10%</option>
                  <option value="0.15">15%</option>
                  <option value="0.2">20%</option>
                </Select>
              </div>
            )}
          </div>
        </Card>

        {/* Section 6–8: Items & Totals */}
        <Card className="p-6">
          <ItemTable
            items={displayItems}
            onChange={setItems}
            currency={currency}
            includeTax={data.includeTax ?? includeTax}
            taxRate={taxRate}
            readOnly={readOnly}
          />
        </Card>

        {/* Approval actions */}
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <Button
            variant="secondary"
            onClick={() => navigate('/purchase-orders')}
            disabled={isBusy}
          >
            Back to list
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={handleRequestChanges}
              disabled={isBusy}
            >
              Request Changes
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={isBusy}
            >
              Reject PO
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isBusy}
            >
              {approveMutation.isPending ? 'Approving…' : 'Approve PO'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
