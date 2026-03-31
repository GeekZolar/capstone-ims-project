import getApiConfig from '../config/api.config'
import { apiClient } from './api'

export interface CreateUserPayload {
  username: string
  firstName: string
  lastName: string
  email: string
  roleId: string
  temporaryPassword: string
  mfaRequired: boolean
}

export interface UserApiPermissions {
  roles?: string[]
  users?: string[]
  auditLogs?: string[]
  forecasts?: string[]
  inventory?: string[]
  purchaseOrders?: string[]
}

export interface UserApiRole {
  roleId: string
  roleName: string
  permissions: UserApiPermissions
}

export interface UserApiRecord {
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserApiRole
  isActive: boolean
  isApproved: boolean
  lastLoginDate: string
  createdDate: string
}

export interface UsersListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UsersListResponse {
  data: UserApiRecord[]
  meta: UsersListMeta
}

function normalizeUsersResponse(body: unknown): UsersListResponse {
  if (!body || typeof body !== 'object') {
    return {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }
  }
  const o = body as Partial<UsersListResponse>
  const rows = Array.isArray(o.data) ? o.data : []
  const meta = o.meta ?? {
    page: 1,
    limit: 20,
    total: rows.length,
    totalPages: 1,
  }
  return { data: rows, meta }
}

export const userService = {
  /**
   * POST create user / approval request. Body matches common APIs: `roleId`, `password` (initial),
   * plus camelCase names; server may ignore unknown fields.
   */
  async createUser(payload: CreateUserPayload): Promise<void> {
    const config = getApiConfig()
    const rawPath = config.usersCreateEndpoint ?? '/users/create'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    await apiClient.post(path, {
      username: payload.username.trim(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim(),
      roleId: payload.roleId.trim(),
      password: payload.temporaryPassword,
      //mfaRequired: payload.mfaRequired,
    })
  },

  /**
   * GET users paged payload `{ data, meta }`.
   */
  async fetchUsers(): Promise<UsersListResponse> {
    //const full = (import.meta.env.VITE_USERS_LIST_URL ?? '').trim()
    // if (full) {
    //   const { data } = await apiClient.get<unknown>(full.replace(/\/+$/, ''))
    //   return normalizeUsersResponse(data)
    // }
    const config = getApiConfig()
    const rawPath = config.usersEndpoint ?? '/users'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const { data } = await apiClient.get<unknown>(path)
    return normalizeUsersResponse(data)
  },
}
