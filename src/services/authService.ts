import getApiConfig from '../config/api.config'
import type { UserProfile, UserRole } from '../types/ims'

/** Request body for the login API */
export interface LoginPayload {
  username: string
  password: string
}

/** User object returned by the login API */
export interface ApiLoginUser {
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: {
    roles?: string[]
    users?: string[]
    auditLogs?: string[]
    forecasts?: string[]
    inventory?: string[]
    purchaseOrders?: string[]
  }
}

/** Response shape from the login API */
export interface ApiLoginResponse {
  accessToken: string
  refreshToken: string
  mfaToken?: string
  expiresIn: number
  mfaRequired: boolean
  user: ApiLoginUser | null
  message?: string
}

/** Normalized response used by the app after login (user is null when mfaRequired and not yet verified) */
export interface LoginResponse {
  token: string
  refreshToken: string
  mfaToken: string
  expiresIn: number
  mfaRequired: boolean
  user: UserProfile | null
  message?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decoded = atob(normalized)
    const payload = JSON.parse(decoded) as unknown
    return isRecord(payload) ? payload : null
  } catch {
    return null
  }
}

function mapTokenToProfile(token: string): UserProfile | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  const role = payload['role']
  const name = payload['name'] ?? payload['username'] ?? payload['email']
  const id = payload['sub'] ?? payload['userId'] ?? payload['id']
  return {
    id: String(id ?? ''),
    name: String(name ?? 'User'),
    email: String(payload['email'] ?? ''),
    role: (typeof role === 'string' ? role : 'read_only') as UserRole,
  }
}

function mapApiUserToProfile(apiUser: ApiLoginUser | undefined | null): UserProfile {
  if (!apiUser) {
    throw new Error('Login response missing user data')
  }
  const raw = apiUser as unknown as Record<string, unknown>
  const first = apiUser.firstName ?? raw['first_name']
  const last = apiUser.lastName ?? raw['last_name']
  const name = ([first, last].filter(Boolean).join(' ') || apiUser.username) ?? ''
  const userId = apiUser.userId ?? raw['userId']
  const role = apiUser.role ?? raw['role']
  return {
    id: String(userId ?? ''),
    name: String(name || 'User'),
    email: String(apiUser.email ?? ''),
    role: (role as UserRole) ?? 'read_only',
  }
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const config = getApiConfig()
    const baseUrl = (config.baseUrl ?? '').replace(/\/$/, '')
    const path = (config.loginEndpoint ?? '').startsWith('/') ? config.loginEndpoint : `/${config.loginEndpoint}`
    const url = `${baseUrl}${path}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: payload.username,
        password: payload.password,
      }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const message =
        typeof body?.message === 'string'
          ? body.message
          : body?.error ?? `Login failed (${response.status})`
      throw new Error(message)
    }

    const body = (await response.json()) as unknown
    const bodyRaw = (body ?? {}) as Record<string, unknown>
    const dataContainer = isRecord(bodyRaw['data']) ? (bodyRaw['data'] as Record<string, unknown>) : bodyRaw
    const data = dataContainer as unknown as ApiLoginResponse
    const dataRaw = dataContainer as Record<string, unknown>
    const rawUser = data.user ?? dataRaw['User'] ?? dataRaw['user']
    const token =
      data.accessToken ??
      (dataRaw['accessToken'] as string | undefined) ??
      (dataRaw['access_token'] as string | undefined) ??
      (dataRaw['token'] as string | undefined) ??
      ''
    const refreshToken =
      data.refreshToken ??
      (dataRaw['refreshToken'] as string | undefined) ??
      (dataRaw['refresh_token'] as string | undefined) ??
      ''
    const mfaRequired = Boolean(
      data.mfaRequired ??
      dataRaw['mfaRequired'] ??
      dataRaw['mfa_required'] ??
      false,
    )

    const user =
      rawUser != null
        ? mapApiUserToProfile(rawUser as ApiLoginUser)
        : (token ? mapTokenToProfile(token) : null)

    return {
      token,
      refreshToken,
      mfaToken: data.mfaToken ?? (dataRaw['mfaToken'] as string) ?? '',
      expiresIn: data.expiresIn ?? 0,
      mfaRequired,
      user,
      message: data.message ?? dataRaw['message'] as string | undefined,
    }
  },

  async verifyMfa(mfaToken: string, mfaCode: string): Promise<LoginResponse> {
    const config = getApiConfig()
    const baseUrl = (config.baseUrl ?? '').replace(/\/$/, '')
    const path = (config.verifyLoginEndpoint ?? '/auth/mfa/verify-login').startsWith('/')
      ? config.verifyLoginEndpoint
      : `/${config.verifyLoginEndpoint ?? 'auth/mfa/verify-login'}`
    const url = `${baseUrl}${path}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaToken, mfaCode }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const message =
        typeof body?.message === 'string'
          ? body.message
          : (body?.error as string) ?? `MFA verification failed (${response.status})`
      throw new Error(message)
    }

    const data = (await response.json()) as ApiLoginResponse
    const dataRaw = data as unknown as Record<string, unknown>
    const rawUser = data.user ?? dataRaw['User'] ?? dataRaw['user']

    if (rawUser == null) {
      throw new Error('MFA verification response missing user data')
    }

    return {
      token: data.accessToken ?? '',
      refreshToken: data.refreshToken ?? '',
      mfaToken: data.mfaToken ?? '',
      expiresIn: data.expiresIn ?? 0,
      mfaRequired: false,
      user: mapApiUserToProfile(rawUser as ApiLoginUser),
      message: data.message,
    }
  },
}
