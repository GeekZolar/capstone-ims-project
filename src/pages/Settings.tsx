import { useState } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Select } from '../components/common/Select'
import { useUiStore } from '../store/uiStore'

export const Settings = () => {
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)
  const mfaEnabled = useUiStore((state) => state.mfaEnabled)
  const setMfaEnabled = useUiStore((state) => state.setMfaEnabled)
  const userAvatar = useUiStore((state) => state.userAvatar)
  const setUserAvatar = useUiStore((state) => state.setUserAvatar)
  const [showMfaModal, setShowMfaModal] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState('')

  const handleMfaToggle = () => {
    if (mfaEnabled) {
      setMfaEnabled(false)
      return
    }
    setShowMfaModal(true)
  }

  const handleMfaCancel = () => {
    setShowMfaModal(false)
    setMfaCode('')
    setMfaError('')
  }

  const handleMfaVerify = () => {
    if (!/^\d{6}$/.test(mfaCode)) {
      setMfaError('Enter the 6-digit code from your authenticator app.')
      return
    }
    setMfaEnabled(true)
    handleMfaCancel()
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
          <h3 className="text-base font-semibold text-slate-900">Organization</h3>
          <Input label="Company name" defaultValue="S&R Foods" />
          <Input label="Default shipping warehouse" defaultValue="Diamond Fulfillment" />
          <Button variant="secondary">Save organization settings</Button>
        </Card>

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
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition"
              aria-pressed={mfaEnabled}
              aria-label="Toggle MFA"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  mfaEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <Button variant="secondary">Save preferences</Button>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Authenticator setup</h3>
          <p className="text-sm text-slate-500">
            Scan the QR code with Google Authenticator or Microsoft Authenticator, then enter the
            code on login when MFA is enabled.
          </p>
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/S%26R%20Foods%3Aks%40srfoods.com%3Fsecret%3DIMSDEMO2026%26issuer%3DS%26R%20Foods"
              alt="MFA setup QR code"
              className="h-44 w-44 rounded-xl bg-white p-3"
            />
            <div className="text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Manual setup key</p>
              <p className="mt-1 rounded-lg bg-white px-3 py-2 font-mono text-slate-700">
                IMSDEMO2026
              </p>
              <p className="mt-2">Issuer: S&amp;R Foods</p>
              <p>Account: ks@srfoods.com</p>
            </div>
          </div>
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
            <h3 className="text-lg font-semibold text-slate-900">Enable MFA</h3>
            <p className="mt-1 text-sm text-slate-500">
              Enter the 6-digit code from your authenticator app to enable MFA.
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
                Verify & Enable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
