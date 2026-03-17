import type { Supplier } from '../../types/po'
import { Select } from '../common/Select'

interface SupplierDropdownProps {
  suppliers: Supplier[] | undefined
  isLoading?: boolean
  value: string
  onChange: (supplierId: string) => void
  onSelect?: (supplier: Supplier | null) => void
  error?: string
  disabled?: boolean
}

export function SupplierDropdown({
  suppliers = [],
  isLoading,
  value,
  onChange,
  onSelect,
  error,
  disabled,
}: SupplierDropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    onChange(id)
    const supplier = id ? suppliers.find((s) => s.id === id) ?? null : null
    onSelect?.(supplier)
  }

  return (
    <Select
      label="Supplier"
      value={value}
      onChange={handleChange}
      error={error}
      disabled={disabled || isLoading}
    >
      <option value="">Select a supplier</option>
      {suppliers.map((s) => (
        <option key={s.id} value={s.id}>
          {s.companyName}
        </option>
      ))}
    </Select>
  )
}
