import getApiConfig from '../config/api.config'
import { coerceUserRole, roleDisplayName, type UserProfile, type UserRole } from '../types/ims'

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
  role?: UserRole
  roleAlt?: UserRole
  roleName?: string
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
  /** True when the user must enter an MFA code before login completes (login challenge). */
  mfaRequired: boolean
  /** True when MFA is enrolled/enabled for the account (Settings toggle / session). */
  mfaEnabled?: boolean
  /** True when the user must change their password before using the app. */
  isDefaultPassword?: boolean
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
  mfaEnabled: boolean
  isDefaultPassword: boolean
  user: UserProfile | null
  message?: string
}

function readIsDefaultPassword(data: ApiLoginResponse, dataRaw: Record<string, unknown>): boolean {
  return Boolean(
    data.isDefaultPassword ??
      dataRaw['isDefaultPassword'] ??
      dataRaw['is_default_password'] ??
      dataRaw['IsDefaultPassword'],
  )
}

function getAuthHeaders(): HeadersInit {
  const token = sessionStorage.getItem('ims_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const roleAltRaw =
    raw['roleAlt'] ??
    raw['role_alt'] ??
    apiUser.roleAlt ??
    apiUser.role ??
    raw['role']
  const roleAlt = coerceUserRole(roleAltRaw)
  const roleNameRaw = raw['roleName'] ?? raw['role_name'] ?? apiUser.roleName
  const roleName =
    typeof roleNameRaw === 'string' && roleNameRaw.trim()
      ? roleNameRaw.trim()
      : roleDisplayName(roleAlt)
  return {
    id: String(userId ?? ''),
    name: String(name || 'User'),
    email: String(apiUser.email ?? ''),
    roleAlt,
    roleName,
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

    const mfaEnabled = Boolean(
      data.mfaEnabled ?? dataRaw['mfa_enabled'] ?? dataRaw['MfaEnabled'],
    )
    const isDefaultPassword = readIsDefaultPassword(data, dataRaw)

    return {
      token: data.accessToken ?? '',
      refreshToken: data.refreshToken ?? '',
      mfaToken: data.mfaToken ?? (dataRaw['mfaToken'] as string) ?? '',
      expiresIn: data.expiresIn ?? 0,
      mfaRequired: data.mfaRequired ?? false,
      mfaEnabled,
      isDefaultPassword,
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

    const mfaEnabled = Boolean(
      data.mfaEnabled ?? dataRaw['mfa_enabled'] ?? dataRaw['MfaEnabled'],
    )
    const isDefaultPassword = readIsDefaultPassword(data, dataRaw)

    return {
      token: data.accessToken ?? '',
      refreshToken: data.refreshToken ?? '',
      mfaToken: data.mfaToken ?? '',
      expiresIn: data.expiresIn ?? 0,
      mfaRequired: data.mfaRequired ?? false,
      mfaEnabled,
      isDefaultPassword,
      user: mapApiUserToProfile(rawUser as ApiLoginUser),
      message: data.message,
    }
  },

  /**
   * Start MFA enrollment for the signed-in user (Settings).
   * POST body: { emailAddress }
   * Response: { qrCodeUrl, mfaEnabled }
   */
  async setupMfa(emailAddress: string): Promise<{ qrCodeUrl: string; mfaEnabled: boolean }> {
    const config = getApiConfig()
    const baseUrl = (config.baseUrl ?? '').replace(/\/$/, '')
    const rawPath = config.mfaSetupEndpoint ?? '/auth/mfa/setup'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const url = `${baseUrl}${path}`

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emailAddress }),
    })

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
    if (!response.ok) {
      const message =
        typeof body?.message === 'string'
          ? body.message
          : (body?.error as string) ?? `MFA setup failed (${response.status})`
      throw new Error(message)
    }

    // Often a data URI: data:image/png;base64,... (works as <img src={...} />)
    const qrCodeUrl = String(body.qrCodeUrl ?? body.qr_code_url ?? '').trim()
    const mfaEnabled = Boolean(body.mfaEnabled ?? body.mfa_enabled)
    return { qrCodeUrl, mfaEnabled }
  },

  /**
   * Confirm MFA enrollment with a TOTP code (Settings).
   * POST body: { code }
   * Response: { verified, message }
   */
  async verifyMfaCode(code: string): Promise<{ verified: boolean; message: string }> {
    const config = getApiConfig()
    const baseUrl = (config.baseUrl ?? '').replace(/\/$/, '')
    const rawPath = config.mfaVerifyEndpoint ?? '/auth/mfa/verify'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const url = `${baseUrl}${path}`

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    })

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
    if (!response.ok) {
      const message =
        typeof body?.message === 'string'
          ? body.message
          : (body?.error as string) ?? `MFA verification failed (${response.status})`
      throw new Error(message)
    }

    const verified = Boolean(body.verified)
    const message = typeof body.message === 'string' ? body.message : String(body.message ?? '')
    return { verified, message }
  },

  /**
   * Disable MFA enrollment with a TOTP code (Settings).
   * POST body: { code }
   */
  async disableMfaEnrollment(code: string): Promise<{ disabledVerified: boolean; message: string }> {
    const config = getApiConfig()
    const baseUrl = (config.baseUrl ?? '').replace(/\/$/, '')
    const rawPath = config.mfaDisableEndpoint ?? '/auth/mfa/verify-disable'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const url = `${baseUrl}${path}`

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code }),
    })

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
    if (!response.ok) {
      const message =
        typeof body?.message === 'string'
          ? body.message
          : (body?.error as string) ?? `MFA enrollment disable failed (${response.status})`
      throw new Error(message)
    }

    const disabledVerified = Boolean(
      body.disabled_verfied ?? body.disabledVerified ?? body.disabled ?? body.verified,
    )
    const message = typeof body.message === 'string' ? body.message : String(body.message ?? '')
    return { disabledVerified, message }
  },

  /**
   * Change password for the signed-in user (e.g. after default/temporary password login).
   * POST body: { currentPassword, newPassword, confirmPassword }
   */
  async changePassword(payload: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<{ message: string }> {
    const config = getApiConfig()
    const baseUrl = (config.baseUrl ?? '').replace(/\/$/, '')
    const rawPath = config.changePasswordEndpoint ?? '/users/change-password'
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
    const url = `${baseUrl}${path}`

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword,
      }),
    })

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
    if (!response.ok) {
      const message =
        typeof body?.message === 'string'
          ? body.message
          : (body?.error as string) ?? `Password change failed (${response.status})`
      throw new Error(message)
    }

    const message =
      typeof body.message === 'string' ? body.message : 'Password changed successfully'
    return { message }
  },
}
