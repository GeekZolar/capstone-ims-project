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

    const data = (await response.json()) as ApiLoginResponse
    const dataRaw = data as unknown as Record<string, unknown>
    const rawUser = data.user ?? dataRaw['User'] ?? dataRaw['user']

    const user =
      rawUser != null ? mapApiUserToProfile(rawUser as ApiLoginUser) : null

    return {
      token: data.accessToken ?? '',
      refreshToken: data.refreshToken ?? '',
      mfaToken: data.mfaToken ?? (dataRaw['mfaToken'] as string) ?? '',
      expiresIn: data.expiresIn ?? 0,
      mfaRequired: data.mfaRequired ?? false,
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
