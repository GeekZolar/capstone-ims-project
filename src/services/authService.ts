import type { UserProfile, UserRole } from '../types/ims'

const demoUsers: Record<string, { name: string; role: UserRole }> = {
  ks: { name: 'Kathy Smith', role: 'system_admin' },
  mo: { name: "Mary O'Neill", role: 'po_approver' },
  jw: { name: 'John Wheeler', role: 'inventory_manager' },
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserProfile
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const key = payload.username.toLowerCase()
    const user = demoUsers[key] ?? {
      name: payload.username,
      role: 'read_only' as UserRole,
    }

    return {
      token: 'demo-token',
      user: {
        id: `user-${key || 'guest'}`,
        name: user.name,
        email: `${key || 'guest'}@srfoods.com`,
        role: user.role,
      },
    }
  },
}
