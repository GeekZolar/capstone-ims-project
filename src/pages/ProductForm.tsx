import { useMemo, useState } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'
import { ErrorState } from '../components/common/ErrorState'
import { useCountries, useSuppliers, useWarehousesByCountry } from '../hooks/usePoQueries'
import { type UtilityProductUpsertPayload } from '../services/utilityService'
import { useCategories } from '../hooks/useProductQueries'

export type ProductFormValues = UtilityProductUpsertPayload & {
  // only for UI binding, not currently sent to API unless backend supports it
  warehouseId?: string
  countryName?: string
}

export function ProductForm({
  title,
  description,
  initialValues,
  submitLabel,
  isSubmitting,
  onCancel,
  onSubmit,
  submitError,
}: {
  title: string
  description?: string
  initialValues: ProductFormValues
  submitLabel: string
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: ProductFormValues) => void | Promise<void>
  submitError?: string | null
}) {
  const [form, setForm] = useState<ProductFormValues>(initialValues)

  const suppliersQuery = useSuppliers()
  const countriesQuery = useCountries()
  const categoriesQuery = useCategories()

  const selectedCountry = useMemo(() => {
    const code = String(form.countryCode ?? '').toUpperCase()
    return countriesQuery.data?.find((c) => String(c.countryCode).toUpperCase() === code) ?? null
  }, [countriesQuery.data, form.countryCode])

  const warehousesQuery = useWarehousesByCountry(selectedCountry?.countryName ?? '')

  const setField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const numberField = (v: string) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const seasonal = Boolean(form.isSeasonal)

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
            Back
          </Button>
        }
      />

      <Card>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            void onSubmit(form)
          }}
        >
          {submitError && (
            <div className="md:col-span-2">
              <ErrorState title="Request failed" description={submitError} compact />
            </div>
          )}

          <Input
            label="Product name *"
            value={form.productName}
            onChange={(e) => setField('productName', e.target.value)}
            placeholder="e.g. VERMOUTH TIPSY ONIONS"
          />
          <Input
            label="Product size *"
            value={form.productSize}
            onChange={(e) => setField('productSize', e.target.value)}
            placeholder="e.g. 6x5oz"
          />

          <Input
            label="SKU *"
            value={form.sku}
            onChange={(e) => setField('sku', e.target.value)}
          />
          <Select
            label="Category *"
            value={form.categoryId}
            onChange={(e) => setField('categoryId', e.target.value)}
            disabled={categoriesQuery.isLoading}
          >
            <option value="">Select category</option>
            {(categoriesQuery.data ?? []).map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </Select>

          <Select
            label="Supplier *"
            value={form.supplierId}
            onChange={(e) => setField('supplierId', e.target.value)}
            disabled={suppliersQuery.isLoading}
          >
            <option value="">Select supplier</option>
            {(suppliersQuery.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName}
              </option>
            ))}
          </Select>

          <Select
            label="Country *"
            value={form.countryCode}
            onChange={(e) => {
              setField('countryCode', e.target.value)
              setField('warehouseId', '')
            }}
            disabled={countriesQuery.isLoading}
          >
            <option value="">Select country</option>
            {(countriesQuery.data ?? []).map((c) => (
              <option key={c.countryCode} value={c.countryCode}>
                {c.countryName} ({c.countryCode})
              </option>
            ))}
          </Select>

          <Select
            label="Warehouse"
            value={form.warehouseId ?? ''}
            onChange={(e) => setField('warehouseId', e.target.value)}
            disabled={!selectedCountry || warehousesQuery.isLoading}
          >
            <option value="">Select warehouse</option>
            {(warehousesQuery.data ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.companyName}
              </option>
            ))}
          </Select>

          <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
            <Input
              label="Min order pallet"
              type="number"
              min={0}
              step={1}
              value={String(form.minOrderPallet)}
              onChange={(e) => setField('minOrderPallet', numberField(e.target.value))}
            />
            <Input
              label="Cases per pallet"
              type="number"
              min={0}
              step={1}
              value={String(form.casePerPallet)}
              onChange={(e) => setField('casePerPallet', numberField(e.target.value))}
            />
            <Input
              label="Shelf life (months)"
              type="number"
              min={0}
              step={1}
              value={String(form.shelfLifeMonth)}
              onChange={(e) => setField('shelfLifeMonth', numberField(e.target.value))}
            />
          </div>

          <Select
            label="Active"
            value={form.isActive ? 'true' : 'false'}
            onChange={(e) => setField('isActive', e.target.value === 'true')}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>

          <Select
            label="Seasonal"
            value={seasonal ? 'true' : 'false'}
            onChange={(e) => setField('isSeasonal', e.target.value === 'true')}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </Select>

          {seasonal && (
            <>
              <Input
                label="Season start date"
                type="date"
                value={form.seasonStartDate ?? ''}
                onChange={(e) => setField('seasonStartDate', e.target.value || null)}
              />
              <Input
                label="Season end date"
                type="date"
                value={form.seasonEndDate ?? ''}
                onChange={(e) => setField('seasonEndDate', e.target.value || null)}
              />
            </>
          )}

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              value={form.description ?? ''}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Note"
              value={form.note ?? ''}
              onChange={(e) => setField('note', e.target.value)}
              rows={3}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

