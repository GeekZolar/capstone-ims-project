import { create } from 'zustand'
import { coerceUserRole, roleDisplayName, type UserProfile } from '../types/ims'

const MFA_QR_SESSION_KEY = 'ims_mfa_qr_data_url'
/** Account-level MFA enrolled (from login `mfaEnabled`, updated in Settings). */
const MFA_ENABLED_SESSION_KEY = 'ims_mfa_enabled'
const MUST_CHANGE_PASSWORD_KEY = 'ims_must_change_password'
/** Temporary: current (default) password for the change-password form only; cleared after change or logout. */
export const CHANGE_PASSWORD_CURRENT_KEY = 'ims_change_password_current'

interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  /** From login API `mfaEnabled`: whether MFA is enrolled for this account (Settings toggle). */
  mfaEnabled: boolean
  /** User must set a new password before using the app (login `isDefaultPassword`). */
  mustChangePassword: boolean
  login: (user: UserProfile, token: string, mfaEnabled?: boolean, mustChangePassword?: boolean) => void
  setMfaEnabled: (value: boolean) => void
  setMustChangePassword: (value: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  mfaEnabled: sessionStorage.getItem(MFA_ENABLED_SESSION_KEY) === 'true',
  mustChangePassword: sessionStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true',
  login: (user, token, mfaEnabled = false, mustChangePassword = false) =>
    set(() => {
      sessionStorage.setItem('ims_token', token)
      sessionStorage.setItem('ims_user', JSON.stringify(user))
      sessionStorage.setItem(MFA_ENABLED_SESSION_KEY, String(mfaEnabled))
      if (mustChangePassword) {
        sessionStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'true')
      } else {
        sessionStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
        sessionStorage.removeItem(CHANGE_PASSWORD_CURRENT_KEY)
      }
      return { user, token, isAuthenticated: true, mfaEnabled, mustChangePassword }
    }),
  setMfaEnabled: (value) =>
    set(() => {
      sessionStorage.setItem(MFA_ENABLED_SESSION_KEY, String(value))
      return { mfaEnabled: value }
    }),
  setMustChangePassword: (value) =>
    set(() => {
      if (value) {
        sessionStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'true')
      } else {
        sessionStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
        sessionStorage.removeItem(CHANGE_PASSWORD_CURRENT_KEY)
      }
      return { mustChangePassword: value }
    }),
  logout: () =>
    set(() => {
      sessionStorage.removeItem('ims_token')
      sessionStorage.removeItem('ims_user')
      sessionStorage.removeItem(MFA_ENABLED_SESSION_KEY)
      sessionStorage.removeItem(MFA_QR_SESSION_KEY)
      sessionStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
      sessionStorage.removeItem(CHANGE_PASSWORD_CURRENT_KEY)
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        mfaEnabled: false,
        mustChangePassword: false,
      }
    }),
}))

function normalizeStoredUser(parsed: unknown): UserProfile | null {
  if (!parsed || typeof parsed !== 'object') return null
  const o = parsed as UserProfile & { role?: string }
  const id = typeof o.id === 'string' ? o.id : ''
  const name = typeof o.name === 'string' ? o.name : 'User'
  const email = typeof o.email === 'string' ? o.email : ''
  const roleAlt = coerceUserRole(o.roleAlt ?? o.role)
  const roleName =
    typeof o.roleName === 'string' && o.roleName.trim()
      ? o.roleName.trim()
      : roleDisplayName(roleAlt)
  if (!id) return null
  return { id, name, email, roleAlt, roleName }
}

export const hydrateAuth = () => {
  const token = sessionStorage.getItem('ims_token')
  const userRaw = sessionStorage.getItem('ims_user')
  if (token && userRaw) {
    try {
      const parsed = JSON.parse(userRaw) as unknown
      const user = normalizeStoredUser(parsed)
      if (!user) throw new Error('Invalid stored user')
      sessionStorage.setItem('ims_user', JSON.stringify(user))
      const mfaEnabled = sessionStorage.getItem(MFA_ENABLED_SESSION_KEY) === 'true'
      const mustChangePassword = sessionStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true'
      useAuthStore.setState({ user, token, isAuthenticated: true, mfaEnabled, mustChangePassword })
    } catch {
      sessionStorage.removeItem('ims_token')
      sessionStorage.removeItem('ims_user')
      sessionStorage.removeItem(MFA_ENABLED_SESSION_KEY)
      sessionStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
      sessionStorage.removeItem(CHANGE_PASSWORD_CURRENT_KEY)
    }
  }
}

/** Persist MFA QR data URL for the session (cleared on logout). */
export function persistMfaQrDataUrl(url: string) {
  sessionStorage.setItem(MFA_QR_SESSION_KEY, url)
}

export function clearMfaQrDataUrl() {
  sessionStorage.removeItem(MFA_QR_SESSION_KEY)
}

export function getMfaQrDataUrlFromSession(): string | null {
  return sessionStorage.getItem(MFA_QR_SESSION_KEY)
}
