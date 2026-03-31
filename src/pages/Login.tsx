import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useToast } from '../components/common/Toast'
import { CHANGE_PASSWORD_CURRENT_KEY } from '../store/authStore'

const schema = z.object({
  username: z.string().min(2, 'Enter a username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof schema>

export const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { notify } = useToast()
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false)
  const [loginErrorMessage, setLoginErrorMessage] = useState('')
  const [pendingMfa, setPendingMfa] = useState<{ mfaToken: string } | null>(null)
  const [showMfaModal, setShowMfaModal] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState('')
  const [mfaSubmitting, setMfaSubmitting] = useState(false)
  /** Password from the sign-in form (needed after MFA and for default-password redirect). */
  const pendingPasswordRef = useRef<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const completeLogin = (
    user: NonNullable<Awaited<ReturnType<typeof authService.login>>['user']>,
    token: string,
    mfaEnabled?: boolean,
    options?: { isDefaultPassword?: boolean; passwordUsed?: string },
  ) => {
    const mustChange = Boolean(options?.isDefaultPassword)
    const pwd = options?.passwordUsed ?? pendingPasswordRef.current ?? ''
    if (mustChange && pwd) {
      sessionStorage.setItem(CHANGE_PASSWORD_CURRENT_KEY, pwd)
    }
    login(user, token, mfaEnabled ?? false, mustChange)

    if (mustChange) {
      notify({
        title: 'New password required',
        message: 'Set a new password to continue.',
        variant: 'info',
      })
      navigate('/change-password', { replace: true })
      return
    }

    notify({
      title: 'Welcome back',
      message: `Signed in as ${user.name}.`,
      variant: 'success',
    })
    navigate('/dashboard')
  }

  const onSubmit = async (values: LoginForm) => {
    pendingPasswordRef.current = values.password
    setLoginErrorMessage('')
    setShowLoginErrorModal(false)
    try {
      const response = await authService.login(values)
      if (response.mfaRequired && response.mfaToken) {
        setPendingMfa({ mfaToken: response.mfaToken })
        setShowMfaModal(true)
        return
      }
      if (response.user != null) {
        completeLogin(response.user, response.token, response.mfaEnabled, {
          isDefaultPassword: response.isDefaultPassword,
          passwordUsed: values.password,
        })
      }
    } catch (err) {
      setLoginErrorMessage(err instanceof Error ? err.message : 'Login failed')
      setShowLoginErrorModal(true)
    }
  }

  const handleMfaCancel = () => {
    setShowMfaModal(false)
    setPendingMfa(null)
    setMfaCode('')
    setMfaError('')
  }

  const handleMfaVerify = async () => {
    if (!/^\d{6}$/.test(mfaCode)) {
      setMfaError('Enter the 6-digit code from your authenticator app.')
      return
    }
    if (!pendingMfa) return
    setMfaError('')
    setMfaSubmitting(true)
    try {
      const response = await authService.verifyMfa(pendingMfa.mfaToken, mfaCode)
      if (response.user != null) {
        completeLogin(response.user, response.token, response.mfaEnabled, {
          isDefaultPassword: response.isDefaultPassword,
          passwordUsed: pendingPasswordRef.current ?? undefined,
        })
        handleMfaCancel()
      }
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Verification failed. Please try again.')
    } finally {
      setMfaSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-muted))] px-4 py-12">
      <div className="mx-auto grid max-w-4xl items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/assets/img/S&R_logo.png"
              alt="S&R Foods logo"
              className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
              S&R Foods IMS
            </p>
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Unified inventory visibility across warehouses and sales channels.
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Track stock by location, manage purchase orders, forecast demand, and stay ahead of stockouts.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Demo accounts</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-500">
              <li>ks / password: any (System Admin)</li>
              <li>mo / password: any (PO Approver)</li>
              <li>jw / password: any (Inventory Manager)</li>
            </ul>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use your S&R Foods credentials to access the IMS.
          </p>
          <div className="mt-6 space-y-4">
            <Input
              label="Username"
              placeholder="ks"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Password"
              placeholder="********"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
      {showMfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Multi-factor authentication</h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter the 6-digit code from your authenticator app to continue.
            </p>
            <div className="mt-4">
              <Input
                label="Authenticator code"
                placeholder="123456"
                value={mfaCode}
                onChange={(event) => {
                  setMfaCode(event.target.value)
                  if (mfaError) setMfaError('')
                }}
                error={mfaError}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={handleMfaCancel} disabled={mfaSubmitting}>
                Cancel
              </Button>
              <Button type="button" onClick={handleMfaVerify} disabled={mfaSubmitting}>
                {mfaSubmitting ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showLoginErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Login failed</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
              {loginErrorMessage || 'Invalid credentials'}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowLoginErrorModal(false)
                  setLoginErrorMessage('')
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
