/** Shared address shape from API */
export interface Address {
  street: string
  city: string
  state: string
  country: string
  zip: string
}

/** Raw row from GET .../utility/suppliers */
export interface SupplierUtilityRecord {
  supplierId: string
  supplierName: string
  address: string
  location: string
  leadTimeDays: number
  isActive: boolean
  createdAt: string
  note: string | null
  contactName: string
  contactEmail: string
  contactPhone: string
}

/** Country from GET /utility/countries */
export interface CountryUtilityRecord {
  countryCode: string
  countryName: string
  createdAt: string
}

/** Supplier for PO forms (dropdown + details); may originate from utility/suppliers */
export interface Supplier {
  id: string
  companyName: string
  address: Address
  phone: string
  /** Present when loaded from utility/suppliers API */
  utilitySource?: SupplierUtilityRecord
}

/** Warehouse from GET /api/warehouses?location= */
export interface WarehouseApi {
  id: string
  companyName: string
  address: Address
  phone: string
  /** Present when loaded from utility/warehouses */
  utilitySource?: WarehouseUtilityRecord
}

/** Raw warehouse row from GET /utility/warehouses */
export interface WarehouseUtilityRecord {
  warehouseId: string
  name: string
  address: string
  location: string
  isActive: boolean
  createdAt: string
}

/** Raw row from GET /utility/products */
export interface ProductUtilityRecord {
  productId: string
  supplierId: string
  productName: string
  description: string | null
  categoryId: string
  productSize: string
  sku: string
  minOrderPallet: number
  casePerPallet: number
  shelfLifeMonth: number
  isActive: boolean
  isSeasonal: boolean
  seasonStartDate: string | null
  seasonEndDate: string | null
  countryCode: string
  createdAt: string
  modifiedAt: string | null
  note: string | null
}

export type LocationCode = 'USA' | 'CAN'

/** Line item in PO create/edit form */
export interface PurchaseOrderLineItem {
  id: string
  sku: string
  productName: string
  description: string
  quantity: number
  rate: number
  amount: number
}

/** Column key for item table customizer */
export type ItemTableColumnKey =
  | 'sku'
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
