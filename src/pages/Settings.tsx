import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Select } from '../components/common/Select'
import { useToast } from '../components/common/Toast'
import { authService } from '../services/authService'
import {
  clearMfaQrDataUrl,
  getMfaQrDataUrlFromSession,
  persistMfaQrDataUrl,
  useAuthStore,
} from '../store/authStore'
import { useUiStore } from '../store/uiStore'

export const Settings = () => {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
  const userAvatar = useUiStore((state) => state.userAvatar)
  const setUserAvatar = useUiStore((state) => state.setUserAvatar)
  const user = useAuthStore((state) => state.user)
  const mfaEnabled = useAuthStore((state) => state.mfaEnabled)
  const setMfaEnabled = useAuthStore((state) => state.setMfaEnabled)
  const { notify } = useToast()

  const [showMfaModal, setShowMfaModal] = useState(false)
  /** `enroll` = confirm setup with code from QR; `disable` = turn off MFA with current authenticator code */
  const [mfaModalPurpose, setMfaModalPurpose] = useState<'enroll' | 'disable'>('enroll')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [setupLoading, setSetupLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)

  useEffect(() => {
    const saved = getMfaQrDataUrlFromSession()
    if (saved) {
      setQrCodeUrl(saved)
    }
  }, [])

  const showMfaSetupBlock = mfaEnabled || Boolean(qrCodeUrl) || setupLoading

  const openDisableMfaModal = () => {
    setMfaModalPurpose('disable')
    setMfaCode('')
    setMfaError('')
    setShowMfaModal(true)
  }

  const handleMfaToggle = async () => {
    if (mfaEnabled) {
      openDisableMfaModal()
      return
    }

    const emailAddress = user?.email?.trim()
    if (!emailAddress) {
      notify({
        title: 'Email required',
        message: 'Sign in again or update your profile so your email is available for MFA setup.',
        variant: 'error',
      })
      return
    }

    setSetupLoading(true)
    setMfaError('')
    try {
      const { qrCodeUrl: url, mfaEnabled: serverMfa } = await authService.setupMfa(emailAddress)
      if (url.trim()) {
        const trimmed = url.trim()
        setQrCodeUrl(trimmed)
        persistMfaQrDataUrl(trimmed)
        if (serverMfa) {
          setMfaEnabled(true)
        }
        return
      }
      if (serverMfa) {
        setMfaEnabled(true)
        notify({
          title: 'MFA enabled',
          message: 'Multi-factor authentication is now active.',
          variant: 'success',
        })
        return
      }
      notify({
        title: 'MFA setup incomplete',
        message: 'The server did not return a QR code. Try again or contact support.',
        variant: 'warning',
      })
    } catch (err) {
      notify({
        title: 'MFA setup failed',
        message: err instanceof Error ? err.message : 'Could not start MFA setup.',
        variant: 'error',
      })
    } finally {
      setSetupLoading(false)
    }
  }

  const handleMfaCancel = () => {
    setShowMfaModal(false)
    setMfaCode('')
    setMfaError('')
    setMfaModalPurpose('enroll')
  }

  const handleMfaVerify = async () => {
    if (!/^\d{6}$/.test(mfaCode)) {
      setMfaError('Enter the 6-digit code from your authenticator app.')
      return
    }
    setVerifyLoading(true)
    setMfaError('')
    try {
      if (mfaModalPurpose === 'disable') {
        const { disabledVerified, message } = await authService.disableMfaEnrollment(mfaCode)
        if (disabledVerified) {
          setMfaEnabled(false)
          setQrCodeUrl(null)
          clearMfaQrDataUrl()
          handleMfaCancel()
          notify({
            title: 'MFA disabled',
            message: message || 'Multi-factor authentication is now disabled.',
            variant: 'success',
          })
          return
        }
        setMfaError(message || 'Verification was not successful. Try again.')
        return
      }

      const { verified, message } = await authService.verifyMfaCode(mfaCode)
      if (verified) {
        setMfaEnabled(true)
        handleMfaCancel()
        notify({
          title: 'MFA enabled',
          message: message || 'Multi-factor authentication is now active.',
          variant: 'success',
        })
      } else {
        setMfaError(message || 'Verification was not successful. Try again.')
      }
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleAvatarUpload = (file?: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      if (result) setUserAvatar(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure organization preferences, themes, and integration settings."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900">User preferences</h3>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-3">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="User profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  No photo
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">Profile photo</p>
                <p className="text-xs text-slate-500">Upload a square image for best results.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleAvatarUpload(event.target.files?.[0])}
                  />
                </label>
                {userAvatar && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setUserAvatar(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Select
            label="Theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as 'light' | 'dark')}
          >
            <option value="light">Light mode</option>
            <option value="dark">Dark mode</option>
          </Select>
          <Select label="Session timeout">
            <option>30 minutes</option>
            <option>45 minutes</option>
            <option>60 minutes</option>
          </Select>

          <Button variant="secondary">Save preferences</Button>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Authenticator setup</h3>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Multi-factor authentication</p>
              <p className="text-xs text-slate-500">
                {mfaEnabled ? 'Enabled' : 'Disabled'} for this account
              </p>
            </div>
            <button
              type="button"
              onClick={handleMfaToggle}
              disabled={setupLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
                mfaEnabled ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              aria-pressed={mfaEnabled}
              aria-label="Toggle MFA"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  mfaEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showMfaSetupBlock && (
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {setupLoading && !qrCodeUrl ? (
                <div className="flex items-center gap-4">
                  <Loader2 className="h-10 w-10 shrink-0 animate-spin text-emerald-600" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Preparing authenticator setup…</p>
                    <p className="text-xs text-slate-500">This may take a few seconds.</p>
                  </div>
                </div>
              ) : qrCodeUrl ? (
                <>
                  <p className="text-sm text-slate-500">
                    Scan the QR code with Google Authenticator or Microsoft Authenticator, then click{' '}
                    <span className="font-medium text-slate-700">Enter verification code</span> and
                    enter the 6-digit code to finish enabling MFA.
                  </p>
                  <img
                    src={qrCodeUrl}
                    alt="MFA setup QR code"
                    className="h-44 w-44 rounded-xl bg-white p-3"
                  />
                  {!showMfaModal && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setMfaModalPurpose('enroll')
                        setMfaCode('')
                        setMfaError('')
                        setShowMfaModal(true)
                      }}
                    >
                      Enter verification code
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Multi-factor authentication is enabled. You will be asked for a code when you sign
                  in.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="space-y-4 lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">Integrations</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { name: 'QuickBooks', status: 'Healthy' },
              { name: 'Extensiv WMS', status: 'Healthy' },
              { name: 'Diamond WMS', status: 'Syncing' },
              { name: 'Shopify', status: 'Degraded' },
              { name: 'Amazon', status: 'Pending' },
              { name: 'Faire', status: 'Healthy' },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-slate-700">{integration.name}</span>
                <span className="text-slate-500">{integration.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {showMfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {mfaModalPurpose === 'disable' ? 'Disable MFA' : 'Enable MFA'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {mfaModalPurpose === 'disable'
                ? 'Enter the 6-digit code from your authenticator app to confirm turning off multi-factor authentication.'
                : 'Enter the 6-digit code from your authenticator app to enable MFA.'}
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
              <Button variant="secondary" type="button" onClick={handleMfaCancel} disabled={verifyLoading}>
                Cancel
              </Button>
              <Button type="button" onClick={handleMfaVerify} disabled={verifyLoading}>
                {verifyLoading
                  ? 'Verifying...'
                  : mfaModalPurpose === 'disable'
                    ? 'Verify & Disable'
                    : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
