import type { UserApiRecord } from '../services/userService'
import { coerceUserRole, roleDisplayName, type PendingUserRequest, type UserListItem, type UserRole } from '../types/ims'

const API_ROLE_NAME_TO_ALT: Record<string, UserRole> = {
  'system administrator': 'system_admin',
  'inventory manager': 'inventory_manager',
  'po creator': 'po_creator',
  'po approver': 'po_approver',
  'forecast editor': 'forecast_editor',
  'read-only': 'read_only',
  'read only': 'read_only',
}

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase()
    if (s === 'true' || s === '1' || s === 'yes') return true
    if (s === 'false' || s === '0' || s === 'no') return false
  }
  return fallback
}

function roleAltFromApiRole(role: UserApiRecord['role']): UserRole {
  const key = role.roleName.trim().toLowerCase()
  return API_ROLE_NAME_TO_ALT[key] ?? coerceUserRole(key.replace(/\s+/g, '_'))
}

export function mapUserApiRecordToListItem(r: UserApiRecord): UserListItem {
  const roleAlt = roleAltFromApiRole(r.role)
  const name =
    [r.firstName, r.lastName].filter((s) => typeof s === 'string' && s.trim()).join(' ').trim() ||
    r.username

  let accountStatus: UserListItem['accountStatus'] = 'active'
  const isActive = asBool((r as unknown as Record<string, unknown>).isActive, true)
  const isApproved = asBool((r as unknown as Record<string, unknown>).isApproved, true)
  if (!isApproved && !isActive) accountStatus = 'pending'
  else if (!isActive) accountStatus = 'inactive'
  // else if (!isApproved) accountStatus = 'pending'

  return {
    id: r.userId,
    name,
    email: r.email,
    roleAlt,
    roleName: r.role.roleName.trim() || roleDisplayName(roleAlt),
    accountStatus,
  }
}

export function mapUserApiRecordsToPendingRequests(records: UserApiRecord[]): PendingUserRequest[] {
  return records
    .filter((r) => asBool((r as unknown as Record<string, unknown>).isApproved, true) === false)
    .map((r) => {
      const roleAlt = roleAltFromApiRole(r.role)
      return {
        id: r.userId,
        username: r.username,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        role: roleAlt,
        temporaryPassword: '',
        mfaRequired: false,
        status: 'pending_approval' as const,
        submittedAt: r.createdDate,
        submittedBy: '—',
      }
    })
}
