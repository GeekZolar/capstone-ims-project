import getApiConfig from '../config/api.config'
import type { RoleRecord } from '../types/ims'
import { apiClient } from './api'
import type {
  CountryUtilityRecord,
  ProductUtilityRecord,
  Supplier,
  SupplierUtilityRecord,
  WarehouseApi,
  WarehouseUtilityRecord,
} from '../types/po'

function mapUtilitySupplierToSupplier(record: SupplierUtilityRecord): Supplier {
  return {
    id: record.supplierId,
    companyName: record.supplierName.trim(),
    address: {
      street: record.address.trim(),
      city: '',
      state: '',
      country: record.location.trim(),
      zip: '',
    },
    phone: record.contactPhone.trim(),
    utilitySource: record,
  }
}

function mapUtilityWarehouseToWarehouse(record: WarehouseUtilityRecord): WarehouseApi {
  return {
    id: record.warehouseId,
    companyName: record.name.trim(),
    address: {
      street: record.address.trim(),
      city: '',
      state: '',
      country: record.location.trim(),
      zip: '',
    },
    phone: '',
    utilitySource: record,
  }
}

export const utilityService = {
  /** GET /utility/suppliers — authenticated (uses apiClient + session token). */
  async getSuppliers(): Promise<Supplier[]> {
    const config = getApiConfig()
    const rawPath = config.suppliersEndpoint ?? '/utility/suppliers'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const { data } = await apiClient.get<SupplierUtilityRecord[]>(path)
    const rows = Array.isArray(data) ? data : []
    return rows
      .filter((r) => r.isActive !== false)
      .map(mapUtilitySupplierToSupplier)
  },

  async getCountries(): Promise<CountryUtilityRecord[]> {
    const config = getApiConfig()
    const rawPath = config.countriesEndpoint ?? '/utility/countries'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const { data } = await apiClient.get<CountryUtilityRecord[]>(path)
    return Array.isArray(data) ? data : []
  },

  async getWarehousesByCountry(countryName: string): Promise<WarehouseApi[]> {
    const config = getApiConfig()
    const rawPath = config.warehousesEndpoint ?? '/utility/warehouses'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`

    const { data } = await apiClient.get<WarehouseUtilityRecord[]>(path)
    const rows = Array.isArray(data) ? data : []

    const normalizedCountryName = countryName.trim()

    return rows
      .filter((r) => r.isActive && String(r.location).trim() === normalizedCountryName)
      .map(mapUtilityWarehouseToWarehouse)
  },

  /** GET /utility/products — authenticated (uses apiClient + session token). */
  async getProducts(): Promise<ProductUtilityRecord[]> {
    const config = getApiConfig()
    const rawPath = (config.productsEndpoint ?? '/utility/products') as string
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const { data } = await apiClient.get<ProductUtilityRecord[]>(path)
    return Array.isArray(data) ? data : []
  },

  async getRegistrationRoles(): Promise<RoleRecord[]> {
    const config = getApiConfig()
    const rawPath = config.registrationRolesEndpoint ?? '/roles/registration'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const { data: payload } = await apiClient.get<unknown>(path)
    const rows: unknown[] = Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)
        ? ((payload as { data: unknown[] }).data ?? [])
        : []
    return rows
      .map((row): RoleRecord | null => {
        if (!row || typeof row !== 'object') return null
        const r = row as Record<string, unknown>
        const roleId = String(r.roleId ?? r.role_id ?? '').trim()
        const roleName = String(r.roleName ?? r.role_name ?? '').trim()
        if (!roleId || !roleName) return null
        const roleAltRaw = String(r.roleAlt ?? r.role_alt ?? '').trim()
        return {
          roleId,
          roleName,
          ...(roleAltRaw ? { roleAlt: roleAltRaw } : {}),
        }
      })
      .filter((r): r is RoleRecord => r !== null)
  },
}

