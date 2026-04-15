import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCountries, useSuppliers, useWarehousesByCountry } from '../hooks/usePoQueries'
import { formatSupplierDetails, formatWarehouseDetails, poService } from '../services/poService'
import type { PurchaseOrderLineItem } from '../types/po'
import { createEmptyLineItem } from '../services/poService'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'
import { ErrorState } from '../components/common/ErrorState'
import { Modal } from '../components/common/Modal'
import { SupplierDropdown } from '../components/po/SupplierDropdown'
import { WarehouseDropdown } from '../components/po/WarehouseDropdown'
import { ItemTable } from '../components/po/ItemTable'

export const PurchaseOrderCreate = () => {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [poDate, setPoDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [location, setLocation] = useState<string>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [shippingMethod, setShippingMethod] = useState('')
  const [includeTax, setIncludeTax] = useState<'' | 'true' | 'false'>('')
  const [taxRate, setTaxRate] = useState(0.1) // 10% default
  const [items, setItems] = useState<PurchaseOrderLineItem[]>(() => [createEmptyLineItem()])
  const [note, setNote] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultModal, setResultModal] = useState<{ open: boolean; ok: boolean; message: string }>({
    open: false,
    ok: true,
    message: '',
  })
  const [dateErrors, setDateErrors] = useState<{ due?: string; delivery?: string }>({})

  const suppliersQuery = useSuppliers()
  const countriesQuery = useCountries()
  const warehousesQuery = useWarehousesByCountry(location || '')

  // Intentionally no auto-selection: user must choose Location.

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
    setLocation(e.target.value)
    setWarehouseId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateDates()) return

    setSubmitError(null)

    if (!supplierId) return setSubmitError('Please select a supplier.')
    if (!warehouseId) return setSubmitError('Please select a warehouse.')
    if (!poDate) return setSubmitError('Please select a PO date.')
    if (!dueDate) return setSubmitError('Please select a due date.')
    if (!deliveryDate) return setSubmitError('Please select a delivery date.')

    const subTotal =
      Math.round(
        items.reduce(
          (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
          0,
        ) * 100,
      ) / 100
    const includeTaxBool = includeTax === 'true'
    const computedTaxAmount = includeTaxBool
      ? Math.round(subTotal * (Number(taxRate) || 0) * 100) / 100
      : 0
    const totalValue = Math.round((subTotal + computedTaxAmount) * 100) / 100

    const lines = items
      .map((it) => ({
        productId: String(it.productId ?? '').trim(),
        sku: String(it.sku ?? '').trim(),
        orderedQty: Number(it.quantity) || 0,
        unitCost: Number(it.rate) || 0,
        // requirement: description to be passed to line note
        notes: String(it.description ?? '').trim(),
      }))
      .filter((l) => Boolean(l.productId) && (l.orderedQty > 0 || l.unitCost > 0 || l.sku))

    if (!lines.length) return setSubmitError('Please add at least one line item with a product.')

    try {
      setIsSubmitting(true)
      await poService.createPurchaseOrder({
        supplierId,
        warehouseId,
        currency,
        purchaseOrderDate: poDate,
        dueDate,
        deliveryDate,
        includeTax: includeTaxBool,
        taxRate: includeTaxBool ? Number(taxRate) || 0 : 0,
        subTotal,
        taxAmount: computedTaxAmount,
        totalValue,
        shippingMethod: shippingMethod.trim(),
        notes: note.trim(),
        quickbooksPoId: '',
        lines,
      })
      setResultModal({
        open: true,
        ok: true,
        message: 'Purchase order submitted for approval successfully.',
      })
    } catch {
      setSubmitError('Failed to save purchase order. Please try again.')
      setResultModal({
        open: true,
        ok: false,
        message: 'Failed to submit purchase order for approval. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currency = location === 'Canada' ? 'CAD' : 'USD'
  const selectedCountryCode = useMemo(() => {
    const match = countriesQuery.data?.find((c) => c.countryName === location)
    return match?.countryCode?.trim() || null
  }, [countriesQuery.data, location])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Purchase Order"
        description="Set up a new purchase order with supplier, warehouse, and line details."
        actions={
          <Button variant="secondary" onClick={() => navigate('/purchase-orders')} disabled={isSubmitting}>
            Back to purchase orders
          </Button>
        }
      />

      <Card>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {submitError && (
            <div className="md:col-span-2">
              <ErrorState title="Unable to save" description={submitError} compact />
            </div>
          )}

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Supplier Information</h2>
          </div>
          <SupplierDropdown
            suppliers={suppliersQuery.data}
            isLoading={suppliersQuery.isLoading}
            value={supplierId}
            onChange={setSupplierId}
            onSelect={() => {}}
          />
          <div className="hidden md:block" aria-hidden />
          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
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

          <div className="md:col-span-2 pt-2">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">PO Dates</h2>
          </div>
          <Input label="PO Date" type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
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

          <div className="md:col-span-2 pt-2">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Location &amp; Warehouse</h2>
          </div>
          <Select
            label="Location"
            value={location}
            onChange={handleLocationChange}
            disabled={countriesQuery.isLoading}
          >
            <option value="">Select a location</option>
            {countriesQuery.data?.map((country) => (
              <option key={country.countryCode} value={country.countryName}>
                {country.countryName}
              </option>
            ))}
          </Select>
          <WarehouseDropdown
            warehouses={warehousesQuery.data}
            isLoading={warehousesQuery.isLoading}
            value={warehouseId}
            onChange={setWarehouseId}
          />
          {countriesQuery.isError && (
            <div className="md:col-span-2">
              <ErrorState
                title="Failed to load countries"
                description="Please try again."
                onRetry={() => countriesQuery.refetch()}
                compact
              />
            </div>
          )}
          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
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

          <div className="md:col-span-2 pt-2">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Shipping</h2>
          </div>
          <Input
            label="Shipping Method"
            placeholder="e.g. FedEx, UPS, Canada Post, DHL"
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value)}
          />
          <div className="hidden md:block" aria-hidden />

          <div className="md:col-span-2 pt-2">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Tax Option</h2>
          </div>
          <Select
            label="Tax"
            value={includeTax}
            onChange={(e) => setIncludeTax(e.target.value as '' | 'true' | 'false')}
          >
            <option value="">Select a tax Option</option>
            <option value="true">Include Tax</option>
            <option value="false">Exclude Tax</option>
          </Select>
          {includeTax === 'true' ? (
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
          ) : (
            <div className="hidden md:block" aria-hidden />
          )}

          <div className="md:col-span-2 pt-2">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Item Details</h2>
          </div>
          <div className="md:col-span-2 overflow-x-auto">
            <ItemTable
              items={items}
              onChange={setItems}
              currency={currency}
              includeTax={includeTax === 'true'}
              taxRate={taxRate}
              supplierId={supplierId}
              countryCode={selectedCountryCode}
              showTitle={false}
              mobileBottomScrollbar
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="Add a general note for the PO"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/purchase-orders')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Submit Purchase Order
            </Button>
          </div>
        </form>
      </Card>

      <Modal
        open={resultModal.open}
        title={resultModal.ok ? 'Submitted' : 'Submission failed'}
        onClose={() => {
          setResultModal((p) => ({ ...p, open: false }))
        }}
        actions={
          <Button
            type="button"
            onClick={() => {
              setResultModal((p) => ({ ...p, open: false }))
              navigate('/purchase-orders')
            }}
          >
            Okay
          </Button>
        }
      >
        <p className="text-sm text-[rgb(var(--text))]">{resultModal.message}</p>
      </Modal>
    </div>
  )
}
