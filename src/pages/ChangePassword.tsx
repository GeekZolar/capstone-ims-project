import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { authService } from '../services/authService'
import {
  CHANGE_PASSWORD_CURRENT_KEY,
  useAuthStore,
} from '../store/authStore'
import { useToast } from '../components/common/Toast'

export const ChangePassword = () => {
  const navigate = useNavigate()
  const { notify } = useToast()
  const mustChangePassword = useAuthStore((s) => s.mustChangePassword)
  const setMustChangePassword = useAuthStore((s) => s.setMustChangePassword)
  const logout = useAuthStore((s) => s.logout)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!mustChangePassword) {
      navigate('/dashboard', { replace: true })
      return
    }
    const stored = sessionStorage.getItem(CHANGE_PASSWORD_CURRENT_KEY) ?? ''
    setCurrentPassword(stored)
  }, [mustChangePassword, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!currentPassword.trim()) {
      setFormError('Your current password is missing. Sign out and sign in again.')
      return
    }
    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation do not match.')
      return
    }
    if (newPassword === currentPassword) {
      setFormError('Choose a new password that is different from your current one.')
      return
    }

    setSubmitting(true)
    try {
      const { message } = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })
      setMustChangePassword(false)
      notify({
        title: 'Password updated',
        message,
        variant: 'success',
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not change password.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mustChangePassword) {
    return null
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-muted))] px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/assets/img/S&R_logo.png"
            alt="S&R Foods logo"
            className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
            S&R Foods IMS
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-slate-900">Change password</h1>
          <p className="mt-1 text-sm text-slate-500">
            You signed in with a default or temporary password. Set a new password to continue.
          </p>

          <div className="mt-6 space-y-4">
            <Input
              label="Current password (default)"
              type="password"
              value={currentPassword}
              readOnly
              autoComplete="current-password"
              className="cursor-not-allowed bg-slate-50 text-slate-600"
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-[rgb(var(--text))]">New password *</span>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 pr-10 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(ev) => {
                    setNewPassword(ev.target.value)
                    if (formError) setFormError('')
                  }}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 inline-flex cursor-pointer items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-[rgb(var(--text))]">Confirm new password *</span>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 pr-10 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(ev) => {
                    setConfirmPassword(ev.target.value)
                    if (formError) setFormError('')
                  }}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 inline-flex cursor-pointer items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            {formError && <p className="text-sm text-rose-600">{formError}</p>}
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={submitting || !currentPassword}>
            {submitting ? 'Updating…' : 'Change password'}
          </Button>

          {!currentPassword && (
            <p className="mt-4 text-center text-xs text-slate-500">
              If this field is empty, sign out and sign in again with your temporary password.
            </p>
          )}

          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-slate-500 underline hover:text-slate-700"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
