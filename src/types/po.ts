/** Shared address shape from API */
export interface Address {
  street: string
  city: string
  state: string
  country: string
  zip: string
}

/** Supplier from GET /api/suppliers */
export interface Supplier {
  id: string
  companyName: string
  address: Address
  phone: string
}

/** Warehouse from GET /api/warehouses?location= */
export interface WarehouseApi {
  id: string
  companyName: string
  address: Address
  phone: string
}

export type LocationCode = 'USA' | 'CAN'

/** Line item in PO create/edit form */
export interface PurchaseOrderLineItem {
  id: string
  productName: string
  description: string
  quantity: number
  rate: number
  amount: number
}

/** Column key for item table customizer */
export type ItemTableColumnKey =
  | 'productName'
  | 'description'
  | 'quantity'
  | 'rate'
  | 'amount'

/** Full PO detail from GET /api/purchase-orders/:id (for approval page) */
export interface PurchaseOrderDetail {
  id: string
  poNumber?: string
  supplierId: string
  supplier?: Supplier
  supplierDetails?: string
  poDate: string
  dueDate: string
  deliveryDate: string
  location: LocationCode
  warehouseId: string
  warehouse?: WarehouseApi
  warehouseDetails?: string
  shippingMethod: string
  includeTax: boolean
  items: PurchaseOrderLineItem[]
  subtotal: number
  taxAmount?: number
  totalAmount: number
  status?: string
}
