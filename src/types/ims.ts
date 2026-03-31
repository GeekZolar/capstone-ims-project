export type UserRole =
  | 'system_admin'
  | 'inventory_manager'
  | 'po_creator'
  | 'po_approver'
  | 'forecast_editor'
  | 'read_only'

const USER_ROLE_VALUES: UserRole[] = [
  'system_admin',
  'inventory_manager',
  'po_creator',
  'po_approver',
  'forecast_editor',
  'read_only',
]

/** Normalize API/storage role strings to a known UserRole (defaults to read_only). */
export function coerceUserRole(value: unknown): UserRole {
  const s = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
  return USER_ROLE_VALUES.includes(s as UserRole) ? (s as UserRole) : 'read_only'
}

const ROLE_DISPLAY_NAME: Record<UserRole, string> = {
  system_admin: 'System Administrator',
  inventory_manager: 'Inventory Manager',
  po_creator: 'PO Creator',
  po_approver: 'PO Approver',
  forecast_editor: 'Forecast Editor',
  read_only: 'Read-only',
}

export function roleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAME[role]
}

/**
 * Resolve a registration/API role row to an allowed `UserRole`, including nested `{ role: { roleName } }`.
 */
export function matchAllowedUserRole(item: unknown, allowedRoles: UserRole[]): UserRole | null {
  if (!item || typeof item !== 'object') return null
  let record = item as Record<string, unknown>
  const nested = record.role
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const r = nested as Record<string, unknown>
    record = {
      ...record,
      role: typeof r.role === 'string' ? r.role : record.role,
      roleName: r.roleName ?? record.roleName,
      name: record.name ?? r.name,
      label: record.label ?? r.label,
      code: record.code ?? r.code,
      value: record.value ?? r.value,
      roleAlt: record.roleAlt ?? r.roleAlt,
      role_code: record.role_code ?? r.role_code,
    }
  }

  const displayToRole: Record<string, UserRole> = {}
  for (const ur of USER_ROLE_VALUES) {
    displayToRole[roleDisplayName(ur).trim().toLowerCase()] = ur
  }

  const stringCandidates: string[] = []
  for (const key of ['role', 'code', 'value', 'roleAlt', 'role_code'] as const) {
    const v = record[key]
    if (typeof v === 'string' && v.trim()) stringCandidates.push(v.trim())
  }

  for (const s of stringCandidates) {
    const norm = s.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_')
    if (allowedRoles.includes(norm as UserRole)) return norm as UserRole
  }
  for (const s of stringCandidates) {
    const c = coerceUserRole(s)
    if (allowedRoles.includes(c)) return c
  }

  const rawLabel = String(record.roleName ?? record.name ?? record.label ?? '').trim()
  const label = rawLabel.toLowerCase()
  if (label) {
    const tryDisplayKey = (key: string): UserRole | null => {
      const r = displayToRole[key]
      return r && allowedRoles.includes(r) ? r : null
    }

    const exact = tryDisplayKey(label)
    if (exact) return exact

    // e.g. API "Read-Only User" vs app label "Read-only"
    const withoutUserSuffix = label.replace(/\s+user\s*$/i, '').trim()
    if (withoutUserSuffix !== label) {
      const fromSuffix = tryDisplayKey(withoutUserSuffix)
      if (fromSuffix) return fromSuffix
    }
  }

  return null
}

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
  /** Access control code from API (`roleAlt`). */
  roleAlt: UserRole
  /** Human-readable label from API (`roleName`). */
  roleName: string
}

export interface ManagedUser extends UserProfile {
  username: string
  firstName: string
  lastName: string
  employeeId: string
  department: string
  location: string
  phone: string
  status: 'active'
  mfaRequired: boolean
  createdAt: string
  createdBy: string
}

/** Normalized row from GET /api/v1/users (and similar) for list UIs. */
export interface UserListItem {
  id: string
  name: string
  email: string
  roleAlt: UserRole
  roleName: string
  accountStatus: 'active' | 'inactive' | 'pending'
}

export interface NewUserRequestInput {
  username: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  temporaryPassword: string
  mfaRequired: boolean
}

export interface PendingUserRequest extends NewUserRequestInput {
  id: string
  status: 'pending_approval' | 'rejected'
  submittedAt: string
  submittedBy: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
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
export interface RoleRecord {
  roleId: string
  roleName: string
  /** Optional slug from API; when missing, map from `roleName` when binding forms. */
  roleAlt?: string
}
