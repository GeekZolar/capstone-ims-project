export type UserRole =
  | 'system_admin'
  | 'inventory_manager'
  | 'po_creator'
  | 'po_approver'
  | 'forecast_editor'
  | 'read_only'

export type InventoryStatus = 'available' | 'damaged' | 'expired' | 'quarantined'
export type PurchaseOrderStatus =
  | 'draft'
  | 'approved'
  | 'sent'
  | 'partially_received'
  | 'received'
  | 'cancelled'

export type TransferStatus = 'pending' | 'in_transit' | 'received' | 'completed'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Warehouse {
  id: string
  code: string
  name: string
  type: 'owned' | '3pl' | 'fba'
  country: 'USA' | 'Canada'
  city: string
  contactName: string
  contactEmail: string
}

export interface InventoryItem {
  sku: string
  name: string
  category: string
  uom: string
  lotNumber: string
  expiryDate: string
  status: InventoryStatus
  warehouseId: string
  availableQty: number
  allocatedQty: number
  inTransitQty: number
}

export interface PurchaseOrderLine {
  sku: string
  description: string
  orderedQty: number
  receivedQty: number
  unitCost: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplier: string
  warehouseId: string
  status: PurchaseOrderStatus
  currency: 'USD' | 'CAD'
  orderDate: string
  expectedDeliveryDate: string
  totalValue: number
  createdBy: string
  approvedBy?: string
  lines: PurchaseOrderLine[]
}

export interface TransferOrder {
  id: string
  transferNumber: string
  sourceWarehouseId: string
  destinationWarehouseId: string
  status: TransferStatus
  createdDate: string
  expectedArrivalDate: string
  items: Array<{ sku: string; quantity: number }>
}

export interface ForecastItem {
  sku: string
  warehouseId?: string
  forecastPeriod: 'Daily' | 'Weekly' | 'Monthly'
  forecastedDemand: number
  overriddenDemand?: number
  accuracyScore?: number
  lastUpdated: string
}

export interface AlertItem {
  id: string
  type: 'stockout' | 'expiry' | 'variance' | 'approval'
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  createdAt: string
  actionLabel?: string
}

export interface DashboardSummary {
  totalSkus: number
  lowStockSkus: number
  expiringLots: number
  pendingApprovals: number
  inventoryAccuracy: number
  stockoutRisk: number
}
