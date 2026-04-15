import { apiClient } from './api'
import type {
  Supplier,
  WarehouseApi,
  LocationCode,
  PurchaseOrderDetail,
  PurchaseOrderLineItem,
  PurchaseOrderListItem,
} from '../types/po'
import apiConfig from '../config/api.config'

function purchaseOrdersEndpoint(): string {
  const cfg = apiConfig()
  return (
    import.meta.env.VITE_PURCHASE_ORDERS_ENDPOINT ?? cfg.purchaseOrdersEndpoint ?? '/purchase-orders'
  ) as string
}

function pickStr(v: unknown): string {
  if (v == null) return ''
  return String(v)
}

function pickNum(v: unknown): number {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeLocation(raw: unknown): LocationCode {
  const s = pickStr(raw).toUpperCase()
  if (s === 'CAN' || s === 'CA' || s === 'CANADA') return 'CAN'
  return 'USA'
}

function mapApiLineToLineItem(raw: Record<string, unknown>, index: number): PurchaseOrderLineItem {
  const prod =
    raw.product && typeof raw.product === 'object' ? (raw.product as Record<string, unknown>) : null
  const qty = pickNum(raw.orderedQty ?? raw.orderedQuantity ?? raw.quantity)
  const rate = pickNum(raw.unitCost ?? raw.rate)
  const namePart = pickStr(prod?.productName ?? raw.productName)
  const sizePart = pickStr(prod?.productSize)
  const productLabel =
    namePart && sizePart ? `${namePart} - ${sizePart}` : namePart || pickStr(raw.productName)
  const amountRaw = raw.lineTotal ?? raw.amount ?? raw.lineAmount
  const computed = Math.round(qty * rate * 100) / 100
  return {
    id: pickStr(raw.id ?? raw.lineId ?? `line-${index}`),
    productId: raw.productId != null ? pickStr(raw.productId) : undefined,
    sku: pickStr(raw.sku ?? prod?.sku),
    productName: productLabel,
    description: pickStr(raw.notes ?? raw.description ?? prod?.description),
    quantity: qty,
    rate: rate,
    amount: amountRaw != null ? pickNum(amountRaw) : computed,
  }
}

function inferLocationFromPayload(raw: Record<string, unknown>): LocationCode {
  const cur = pickStr(raw.currency).toUpperCase()
  if (cur === 'CAD' || cur === 'CA') return 'CAN'
  if (cur === 'USD' || cur === 'US') return 'USA'
  const sup =
    raw.supplier && typeof raw.supplier === 'object' ? (raw.supplier as Record<string, unknown>) : null
  const wh =
    raw.warehouse && typeof raw.warehouse === 'object' ? (raw.warehouse as Record<string, unknown>) : null
  const loc = `${pickStr(sup?.location)} ${pickStr(wh?.location)}`.toLowerCase()
  if (loc.includes('canada')) return 'CAN'
  return normalizeLocation(raw.location ?? raw.countryCode)
}

function normalizeTaxRateDecimal(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined
  let n = pickNum(raw)
  if (n > 1) n = n / 100
  return n
}

function normalizePurchaseOrderDetail(raw: Record<string, unknown>): PurchaseOrderDetail {
  const linesRaw = raw.lines ?? raw.items
  const lines = Array.isArray(linesRaw) ? linesRaw : []
  const items = lines.map((row, i) => mapApiLineToLineItem(row as Record<string, unknown>, i))

  const subTotal = pickNum(raw.subTotal ?? raw.subtotal)
  const taxAmount = pickNum(raw.taxAmount)
  const totalValue = pickNum(raw.totalValue ?? raw.totalAmount)

  const currencyRaw = pickStr(raw.currency).toUpperCase()
  const currency =
    currencyRaw === 'CAD' || currencyRaw === 'CA' ? ('CAD' as const) : ('USD' as const)

  const sup = raw.supplier && typeof raw.supplier === 'object' ? (raw.supplier as Record<string, unknown>) : null
  const wh = raw.warehouse && typeof raw.warehouse === 'object' ? (raw.warehouse as Record<string, unknown>) : null
  const supplierName =
    pickStr(raw.supplierName) || pickStr(sup?.companyName ?? sup?.supplierName ?? sup?.name)

  const supplierDetailsFlat = raw.supplierDetails != null ? pickStr(raw.supplierDetails) : ''
  const supplierDetailsBuilt =
    !supplierDetailsFlat && sup
      ? [pickStr(sup.supplierName), pickStr(sup.address), pickStr(sup.location)].filter(Boolean).join('\n')
      : supplierDetailsFlat

  const warehouseDetailsFlat = raw.warehouseDetails != null ? pickStr(raw.warehouseDetails) : ''
  const warehouseDetailsBuilt =
    !warehouseDetailsFlat && wh
      ? [pickStr(wh.name), pickStr(wh.address), pickStr(wh.location)].filter(Boolean).join('\n')
      : warehouseDetailsFlat

  return {
    id: pickStr(raw.id),
    poNumber: raw.poNumber != null ? pickStr(raw.poNumber) : undefined,
    supplierId: pickStr(raw.supplierId),
    supplierName: supplierName || undefined,
    supplierDetails: supplierDetailsBuilt || undefined,
    poDate: pickStr(raw.purchaseOrderDate ?? raw.poDate),
    dueDate: pickStr(raw.dueDate),
    deliveryDate: pickStr(raw.deliveryDate),
    location: inferLocationFromPayload(raw),
    warehouseId: pickStr(raw.warehouseId),
    warehouseName: pickStr(raw.warehouseName ?? wh?.name) || undefined,
    warehouseDetails: warehouseDetailsBuilt || undefined,
    shippingMethod: pickStr(raw.shippingMethod),
    includeTax: Boolean(raw.includeTax),
    taxRate: normalizeTaxRateDecimal(raw.taxRate),
    notes: raw.notes != null ? pickStr(raw.notes) : undefined,
    items,
    subtotal: subTotal,
    taxAmount,
    totalAmount: totalValue || subTotal + taxAmount,
    currency,
    status: raw.status != null ? pickStr(raw.status) : undefined,
  }
}

function normalizeListItem(raw: Record<string, unknown>): PurchaseOrderListItem {
  const currencyRaw = pickStr(raw.currency).toUpperCase()
  const currency =
    currencyRaw === 'CAD' || currencyRaw === 'CA' ? ('CAD' as const) : ('USD' as const)
  const sup = raw.supplier && typeof raw.supplier === 'object' ? (raw.supplier as Record<string, unknown>) : null
  const wh = raw.warehouse && typeof raw.warehouse === 'object' ? (raw.warehouse as Record<string, unknown>) : null
  const supplierNameFlat = pickStr(
    raw.supplierName ?? sup?.companyName ?? sup?.supplierName ?? sup?.name,
  )
  const warehouseNameFlat = pickStr(raw.warehouseName ?? wh?.name)
  return {
    id: pickStr(raw.id),
    poNumber: raw.poNumber != null ? pickStr(raw.poNumber) : undefined,
    supplierId: raw.supplierId != null ? pickStr(raw.supplierId) : undefined,
    supplierName: supplierNameFlat || undefined,
    warehouseId: raw.warehouseId != null ? pickStr(raw.warehouseId) : undefined,
    warehouseName: warehouseNameFlat || undefined,
    status: pickStr(raw.status),
    orderDate: pickStr(raw.purchaseOrderDate ?? raw.orderDate ?? raw.poDate),
    expectedDeliveryDate: pickStr(raw.deliveryDate ?? raw.expectedDeliveryDate ?? raw.dueDate),
    totalValue: pickNum(raw.totalValue ?? raw.totalAmount ?? raw.subTotal),
    currency,
    detail: normalizePurchaseOrderDetail(raw),
  }
}

export const poService = {
  async getWarehouses(location: LocationCode): Promise<WarehouseApi[]> {
    const { data } = await apiClient.get<WarehouseApi[]>('/warehouses', {
      params: { location },
    })
    return data ?? []
  },

  async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<CreatePurchaseOrderResponse> {
    const { data } = await apiClient.post<CreatePurchaseOrderResponse>(purchaseOrdersEndpoint(), payload)
    return data
  },

  async listPurchaseOrders(): Promise<PurchaseOrderListItem[]> {
    const { data } = await apiClient.get<unknown>(purchaseOrdersEndpoint())
    let rows: unknown[] | null = null
    if (Array.isArray(data)) {
      rows = data
    } else if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>
      if (Array.isArray(o.items)) rows = o.items
      else if (Array.isArray(o.data)) rows = o.data as unknown[]
    }
    if (!rows) return []
    return rows.map((row) => normalizeListItem(row as Record<string, unknown>))
  },

  async getPurchaseOrder(id: string): Promise<PurchaseOrderDetail> {
    const { data } = await apiClient.get<unknown>(
      `${purchaseOrdersEndpoint().replace(/\/?$/, '')}/${encodeURIComponent(id)}`,
    )
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid purchase order response')
    }
    return normalizePurchaseOrderDetail(data as Record<string, unknown>)
  },

  async approvePurchaseOrder(id: string): Promise<void> {
    const base = purchaseOrdersEndpoint().replace(/\/$/, '')
    await apiClient.post(`${base}/${encodeURIComponent(id)}/approve`)
  },

  async rejectPurchaseOrder(id: string, payload?: { reason?: string }): Promise<void> {
    const base = purchaseOrdersEndpoint().replace(/\/$/, '')
    await apiClient.post(`${base}/${encodeURIComponent(id)}/reject`, payload ?? {})
  },

  async requestChangesPurchaseOrder(id: string, payload?: { comment?: string }): Promise<void> {
    const base = purchaseOrdersEndpoint().replace(/\/$/, '')
    await apiClient.post(`${base}/${encodeURIComponent(id)}/request-changes`, payload ?? {})
  },
}

export interface CreatePurchaseOrderLinePayload {
  productId: string
  sku: string
  orderedQty: number
  unitCost: number
  notes?: string
}

export interface CreatePurchaseOrderPayload {
  supplierId: string
  warehouseId: string
  currency: 'USD' | 'CAD'
  purchaseOrderDate: string
  dueDate: string
  deliveryDate: string
  includeTax: boolean
  taxRate: number
  subTotal: number
  taxAmount: number
  totalValue: number
  shippingMethod: string
  notes: string
  quickbooksPoId?: string
  lines: CreatePurchaseOrderLinePayload[]
}

export interface CreatePurchaseOrderResponse {
  id: string
  [key: string]: unknown
}

/** Format supplier for display in read-only text area (utility API order when available). */
export function formatSupplierDetails(supplier: Supplier | null | undefined): string {
  if (!supplier) return ''
  if (supplier.utilitySource) {
    const u = supplier.utilitySource
    return [
      u.supplierName.trim(),
      u.address.trim(),
      u.location.trim(),
      u.contactName.trim(),
      u.contactEmail.trim(),
      u.contactPhone.trim(),
    ].join('\n')
  }
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
  if (warehouse.utilitySource) {
    const u = warehouse.utilitySource
    // Required order: name, address, location
    return [u.name.trim(), u.address.trim(), u.location.trim()].join('\n')
  }

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
    productId: '',
    sku: '',
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
