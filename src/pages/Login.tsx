import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useToast } from '../components/common/Toast'
import { useUiStore } from '../store/uiStore'

const schema = z.object({
  username: z.string().min(2, 'Enter a username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof schema>

export const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { notify } = useToast()
  const mfaEnabled = useUiStore((state) => state.mfaEnabled)
  const [pendingAuth, setPendingAuth] = useState<{
    user: Awaited<ReturnType<typeof authService.login>>['user']
    token: string
  } | null>(null)
  const [showMfaModal, setShowMfaModal] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const completeLogin = (user: Awaited<ReturnType<typeof authService.login>>['user'], token: string) => {
    login(user, token)
    notify({
      title: 'Welcome back',
      message: `Signed in as ${user.name}.`,
      variant: 'success',
    })
    navigate('/dashboard')
  }

  const onSubmit = async (values: LoginForm) => {
    const response = await authService.login(values)
    if (mfaEnabled) {
      setPendingAuth({ user: response.user, token: response.token })
      setShowMfaModal(true)
      return
    }
    completeLogin(response.user, response.token)
  }

  const handleMfaCancel = () => {
    setShowMfaModal(false)
    setPendingAuth(null)
    setMfaCode('')
    setMfaError('')
  }

  const handleMfaVerify = () => {
    if (!/^\d{6}$/.test(mfaCode)) {
      setMfaError('Enter the 6-digit code from your authenticator app.')
      return
    }
    if (pendingAuth) {
      completeLogin(pendingAuth.user, pendingAuth.token)
    }
    handleMfaCancel()
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
              <Button variant="secondary" type="button" onClick={handleMfaCancel}>
                Cancel
              </Button>
              <Button type="button" onClick={handleMfaVerify}>
                Verify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
