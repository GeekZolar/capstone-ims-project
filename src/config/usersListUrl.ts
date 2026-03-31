import getApiConfig from './api.config'

/** Full URL from env, else relative path joined with `VITE_API_BASE_URL` by axios (same idea as `userService.fetchUsers`). */
export function resolveUsersListUrl(): string {
  const full = (import.meta.env.VITE_USERS_LIST_URL ?? '').trim()
  if (full) return full.replace(/\/+$/, '')
  const c = getApiConfig()
  const rawPath = c.usersEndpoint ?? '/users'
  return rawPath.startsWith('/') ? rawPath : `/${rawPath}`
}
