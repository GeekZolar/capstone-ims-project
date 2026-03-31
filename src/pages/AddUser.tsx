import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Select } from '../components/common/Select'
import { useToast } from '../components/common/Toast'
import { useAuthStore } from '../store/authStore'
import { userService } from '../services/userService'
import { utilityService } from '../services/utilityService'
import { getAxiosErrorMessage } from '../utils/apiError'
import {
  coerceUserRole,
  matchAllowedUserRole,
  type NewUserRequestInput,
  type RoleRecord,
  type UserRole,
} from '../types/ims'

const ROLES_FOR_LABEL_MAP: UserRole[] = [
  'system_admin',
  'inventory_manager',
  'po_creator',
  'po_approver',
  'forecast_editor',
  'read_only',
]

function userRoleFromRoleRecord(rec: RoleRecord): UserRole {
  if (rec.roleAlt) {
    return coerceUserRole(rec.roleAlt)
  }
  return matchAllowedUserRole(
    { roleName: rec.roleName, roleId: rec.roleId },
    ROLES_FOR_LABEL_MAP,
  ) ?? 'read_only'
}

const initialForm: NewUserRequestInput = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'read_only',
  temporaryPassword: '',
  mfaRequired: false,
}

export const AddUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const currentUser = useAuthStore((state) => state.user)
  const [form, setForm] = useState<NewUserRequestInput>(initialForm)
  const [registrationRoles, setRegistrationRoles] = useState<RoleRecord[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [rolesLoading, setRolesLoading] = useState(true)
  const [rolesError, setRolesError] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true)
      setRolesError(null)
      try {
        const records = await utilityService.getRegistrationRoles()
        setRegistrationRoles(records)

        if (records.length === 0) {
          setRolesError('No roles were returned by the API')
          return
        }
        // Do not auto-select; user must explicitly choose a role.
        setSelectedRoleId('')
        setForm((prev) => ({ ...prev, role: 'read_only' }))
      } catch (error) {
        setRolesError(error instanceof Error ? error.message : 'Failed to load roles')
      } finally {
        setRolesLoading(false)
      }
    }

    void fetchRoles()
  }, [])

  const onChange = (field: keyof NewUserRequestInput, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onRoleIdChange = (roleId: string) => {
    setSelectedRoleId(roleId)
    const rec = registrationRoles.find((r) => r.roleId === roleId)
    if (rec) {
      setForm((prev) => ({ ...prev, role: userRoleFromRoleRecord(rec) }))
    }
  }

  const roleSelectValue = selectedRoleId

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentUser) return

    const requiredFields: Array<keyof NewUserRequestInput> = [
      'username',
      'firstName',
      'lastName',
      'email',
      'temporaryPassword',
    ]

    const hasMissing = requiredFields.some((field) => String(form[field]).trim().length === 0)
    if (hasMissing) {
      notify({
        title: 'Missing required fields',
        message: 'Complete all mandatory fields before submitting.',
        variant: 'warning',
      })
      return
    }

    if (!selectedRoleId.trim()) {
      notify({
        title: 'Role required',
        message: 'Select a role from the list.',
        variant: 'warning',
      })
      return
    }

    try {
      await userService.createUser({
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        roleId: selectedRoleId,
        temporaryPassword: form.temporaryPassword,
        mfaRequired: form.mfaRequired,
      })
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      notify({
        title: 'User request submitted',
        message: `${form.firstName} ${form.lastName} is pending approval.`,
        variant: 'success',
      })
      navigate('/users/approve')
    } catch (error) {
      setSubmitErrorMessage(getAxiosErrorMessage(error))
      setShowErrorModal(true)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add User"
        description="Create a new user onboarding request for admin approval."
        actions={
          <Button variant="secondary" onClick={() => navigate('/users')}>
            Back to users
          </Button>
        }
      />

      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Username *"
            value={form.username}
            onChange={(event) => onChange('username', event.target.value)}
            placeholder="jdoe"
          />
          <Select
            label="Role *"
            value={roleSelectValue}
            onChange={(event) => onRoleIdChange(event.target.value)}
            disabled={rolesLoading || registrationRoles.length === 0}
            error={rolesError ?? undefined}
          >
            {rolesLoading && (
              <option value="" disabled>
                Loading roles…
              </option>
            )}
            {!rolesLoading && (
              <option value="" disabled>
                Select role...
              </option>
            )}
            {!rolesLoading && registrationRoles.length === 0 && (
              <option value="" disabled>
                {rolesError ?? 'No roles available'}
              </option>
            )}
            {!rolesLoading &&
              registrationRoles.map((rec) => (
                <option key={rec.roleId} value={rec.roleId}>
                  {rec.roleName}
                </option>
              ))}
          </Select>
          <Input
            label="First name *"
            value={form.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
          />
          <Input
            label="Last name *"
            value={form.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
          />
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="name@srfoods.com"
          />

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[rgb(var(--text))]">Temporary password *</span>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 pr-10 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                type={showTemporaryPassword ? 'text' : 'password'}
                value={form.temporaryPassword}
                onChange={(event) => onChange('temporaryPassword', event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowTemporaryPassword((v) => !v)}
                className="absolute inset-y-0 right-2 inline-flex cursor-pointer items-center justify-center text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
                aria-label={showTemporaryPassword ? 'Hide password' : 'Show password'}
              >
                {showTemporaryPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          {/* <label className="flex items-end gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.mfaRequired}
              onChange={(event) => onChange('mfaRequired', event.target.checked)}
            />
            Require MFA at first login
          </label> */}

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
              Cancel
            </Button>
            <Button type="submit">Submit for approval</Button>
          </div>
        </form>
      </Card>

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Request failed</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
              {submitErrorMessage || 'Bad request'}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowErrorModal(false)
                  setSubmitErrorMessage('')
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
