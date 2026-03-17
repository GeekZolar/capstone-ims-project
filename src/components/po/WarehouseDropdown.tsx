import type { WarehouseApi } from '../../types/po'
import { Select } from '../common/Select'

interface WarehouseDropdownProps {
  warehouses: WarehouseApi[] | undefined
  isLoading?: boolean
  value: string
  onChange: (warehouseId: string) => void
  onSelect?: (warehouse: WarehouseApi | null) => void
  error?: string
  disabled?: boolean
}

export function WarehouseDropdown({
  warehouses = [],
  isLoading,
  value,
  onChange,
  onSelect,
  error,
  disabled,
}: WarehouseDropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    onChange(id)
    const warehouse = id ? warehouses.find((w) => w.id === id) ?? null : null
    onSelect?.(warehouse)
  }

  return (
    <Select
      label="Warehouse"
      value={value}
      onChange={handleChange}
      error={error}
      disabled={disabled || isLoading}
    >
      <option value="">Select a warehouse</option>
      {warehouses.map((w) => (
        <option key={w.id} value={w.id}>
          {w.companyName}
        </option>
      ))}
    </Select>
  )
}
