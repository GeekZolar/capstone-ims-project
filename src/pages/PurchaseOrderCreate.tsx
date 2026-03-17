import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSuppliers, useWarehousesByLocation } from '../hooks/usePoQueries'
import { formatSupplierDetails, formatWarehouseDetails } from '../services/poService'
import type { LocationCode, PurchaseOrderLineItem } from '../types/po'
import { createEmptyLineItem } from '../services/poService'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'
import { ErrorState } from '../components/common/ErrorState'
import { SupplierDropdown } from '../components/po/SupplierDropdown'
import { WarehouseDropdown } from '../components/po/WarehouseDropdown'
import { ItemTable } from '../components/po/ItemTable'

export const PurchaseOrderCreate = () => {
  const navigate = useNavigate()
  const [supplierId, setSupplierId] = useState('')
  const [poDate, setPoDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [location, setLocation] = useState<LocationCode | ''>('USA')
  const [warehouseId, setWarehouseId] = useState('')
  const [shippingMethod, setShippingMethod] = useState('')
  const [includeTax, setIncludeTax] = useState(true)
  const [taxRate, setTaxRate] = useState(0.1) // 10% default
  const [items, setItems] = useState<PurchaseOrderLineItem[]>(() => [createEmptyLineItem()])
  const [dateErrors, setDateErrors] = useState<{ due?: string; delivery?: string }>({})

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

  const validateDates = () => {
    const errors: { due?: string; delivery?: string } = {}
    if (poDate && dueDate && new Date(dueDate) < new Date(poDate)) {
      errors.due = 'Due date must be on or after PO date'
    }
    if (poDate && deliveryDate && new Date(deliveryDate) < new Date(poDate)) {
      errors.delivery = 'Delivery date must be on or after PO date'
    }
    setDateErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LocationCode | ''
    setLocation(value || 'USA')
    setWarehouseId('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateDates()) return
    // TODO: POST to create PO API
    navigate('/purchase-orders')
  }

  const currency = location === 'CAN' ? 'CAD' : 'USD'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Purchase Order"
        description="Set up a new purchase order with supplier, warehouse, and line details."
        actions={
          <>
            <Button variant="secondary" type="button" onClick={() => navigate('/purchase-orders')}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Save PO
            </Button>
          </>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Supplier Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">
            Supplier Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <SupplierDropdown
              suppliers={suppliersQuery.data}
              isLoading={suppliersQuery.isLoading}
              value={supplierId}
              onChange={setSupplierId}
              onSelect={() => {}}
            />
            <div />
            <div className="md:col-span-2 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Textarea
                label="Supplier Details"
                value={supplierDetails}
                readOnly
                rows={5}
                placeholder="Select a supplier to view details"
              />
              {suppliersQuery.isError && (
                <ErrorState
                  title="Failed to load suppliers"
                  description="Please try again."
                  onRetry={() => suppliersQuery.refetch()}
                  compact
                />
              )}
            </div>
          </div>
        </Card>

        {/* Section 2: PO Dates */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">PO Dates</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="PO Date"
              type="date"
              value={poDate}
              onChange={(e) => setPoDate(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                setDateErrors((prev) => ({ ...prev, due: undefined }))
              }}
              error={dateErrors.due}
            />
            <Input
              label="Delivery Date"
              type="date"
              value={deliveryDate}
              onChange={(e) => {
                setDeliveryDate(e.target.value)
                setDateErrors((prev) => ({ ...prev, delivery: undefined }))
              }}
              error={dateErrors.delivery}
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
              value={location}
              onChange={handleLocationChange}
            >
              <option value="USA">USA</option>
              <option value="CAN">CAN</option>
            </Select>
            <WarehouseDropdown
              warehouses={warehousesQuery.data}
              isLoading={warehousesQuery.isLoading}
              value={warehouseId}
              onChange={setWarehouseId}
            />
            <div />
            <div className="md:col-span-2 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Textarea
                label="Warehouse Details"
                value={warehouseDetails}
                readOnly
                rows={5}
                placeholder="Select a warehouse to view details"
              />
              {warehousesQuery.isError && (
                <ErrorState
                  title="Failed to load warehouses"
                  description="Please try again."
                  onRetry={() => warehousesQuery.refetch()}
                  compact
                />
              )}
            </div>
          </div>
        </Card>

        {/* Section 4: Shipping */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Shipping</h2>
          <Input
            label="Shipping Method"
            placeholder="e.g. FedEx, UPS, Canada Post, DHL"
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
          />
        </Card>

        {/* Section 5: Tax Option */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgb(var(--text))]">Tax Option</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 max-w-xl">
            <div className="flex-1">
              <Select
                label="Tax"
                value={includeTax ? 'true' : 'false'}
                onChange={(e) => setIncludeTax(e.target.value === 'true')}
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

        {/* Section 6–8: Item Details Table & Totals */}
        <Card className="p-6">
          <ItemTable
            items={items}
            onChange={setItems}
            currency={currency}
            includeTax={includeTax}
            taxRate={taxRate}
          />
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/purchase-orders')}>
            Cancel
          </Button>
          <Button type="submit">Save Purchase Order</Button>
        </div>
      </form>
    </div>
  )
}
