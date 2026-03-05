import { apiClient } from './api'
import type {
  Supplier,
  WarehouseApi,
  LocationCode,
  PurchaseOrderDetail,
  PurchaseOrderLineItem,
} from '../types/po'

export const poService = {
  async getSuppliers(): Promise<Supplier[]> {
    const { data } = await apiClient.get<Supplier[]>('/suppliers')
    return data ?? []
  },

  async getWarehouses(location: LocationCode): Promise<WarehouseApi[]> {
    const { data } = await apiClient.get<WarehouseApi[]>('/warehouses', {
      params: { location },
    })
    return data ?? []
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrderDetail> {
    const { data } = await apiClient.get<PurchaseOrderDetail>(
      `/purchase-orders/${encodeURIComponent(id)}`,
    )
    return data
  },

  async approvePurchaseOrder(id: string): Promise<void> {
    await apiClient.post(`/purchase-orders/${encodeURIComponent(id)}/approve`)
  },

  async rejectPurchaseOrder(id: string, payload?: { reason?: string }): Promise<void> {
    await apiClient.post(`/purchase-orders/${encodeURIComponent(id)}/reject`, payload ?? {})
  },

  async requestChangesPurchaseOrder(id: string, payload?: { comment?: string }): Promise<void> {
    await apiClient.post(`/purchase-orders/${encodeURIComponent(id)}/request-changes`, payload ?? {})
  },
}

/** Format supplier for display in read-only text area */
export function formatSupplierDetails(supplier: Supplier | null | undefined): string {
  if (!supplier) return ''
  const { companyName, address, phone } = supplier
  const lines = [
    companyName,
    address.street,
    [address.city, address.state].filter(Boolean).join(', '),
    [address.country, address.zip].filter(Boolean).join(' '),
    phone ? `Phone: ${phone}` : '',
  ].filter(Boolean)
  return lines.join('\n')
}

/** Format warehouse for display in read-only text area */
export function formatWarehouseDetails(warehouse: WarehouseApi | null | undefined): string {
  if (!warehouse) return ''
  const { companyName, address, phone } = warehouse
  const lines = [
    companyName,
    address.street,
    [address.city, address.state].filter(Boolean).join(', '),
    [address.country, address.zip].filter(Boolean).join(' '),
    phone ? `Phone: ${phone}` : '',
  ].filter(Boolean)
  return lines.join('\n')
}

export function createEmptyLineItem(id?: string): PurchaseOrderLineItem {
  const uid = id ?? `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return {
    id: uid,
    productName: '',
    description: '',
    quantity: 0,
    rate: 0,
    amount: 0,
  }
}

export function computeLineAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate * 100) / 100
}
