import axios from 'axios'
import type { AxiosError } from 'axios'

/** Prefer server validation / problem details over generic axios text. */
export function getAxiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<unknown>
    const data = err.response?.data
    if (typeof data === 'string' && data.trim()) return data.trim()
    if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>
      if (Array.isArray(o.message) && o.message.every((x) => typeof x === 'string')) {
        const joined = (o.message as string[]).map((s) => s.trim()).filter(Boolean).join('\n')
        if (joined) return joined
      }
      if (typeof o.message === 'string' && o.message.trim()) return o.message.trim()
      if (typeof o.title === 'string' && o.title.trim()) return o.title.trim()
      if (typeof o.detail === 'string' && o.detail.trim()) return o.detail.trim()
      if (typeof o.error === 'string' && o.error.trim()) return o.error.trim()
      const errs = o.errors
      if (errs && typeof errs === 'object' && !Array.isArray(errs)) {
        const lines = Object.entries(errs as Record<string, unknown>).map(([key, val]) => {
          if (Array.isArray(val)) return `${key}: ${val.join(', ')}`
          if (typeof val === 'string') return `${key}: ${val}`
          return `${key}: ${JSON.stringify(val)}`
        })
        if (lines.length) return lines.join('; ')
      }
    }
    return err.message
  }
  if (error instanceof Error) return error.message
  return 'Request failed'
}
