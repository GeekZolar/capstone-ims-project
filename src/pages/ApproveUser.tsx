import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { ErrorState } from '../components/common/ErrorState'
import { Input } from '../components/common/Input'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { StatusPill } from '../components/common/StatusPill'
import { useToast } from '../components/common/Toast'
import { resolveUsersListUrl } from '../config/usersListUrl'
import { apiClient } from '../services/api'
import { userService } from '../services/userService'
import { useAuthStore } from '../store/authStore'
import { roleDisplayName } from '../types/ims'
import { mapUserApiRecordsToPendingRequests } from '../utils/userApiMappers'

export const ApproveUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const currentUser = useAuthStore((state) => state.user)
  const [rejectionReason, setRejectionReason] = useState('')

  const pendingQuery = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: async () => {
      const res = await userService.fetchUsers()
      return mapUserApiRecordsToPendingRequests(res.data)
    },
  })

  const pendingRequests =
    pendingQuery.data?.filter((request) => request.status === 'pending_approval') ?? []
//
  const approve = async (requestId: string) => {
    if (!currentUser) return
    try {
      const base = resolveUsersListUrl().replace(/\/+$/, '')
      await apiClient.patch(`${base}/${encodeURIComponent(requestId)}/approve`
      //, {
        //approverUserId: currentUser.id,
        //approverName: currentUser.name,
      //}
    )
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      notify({
        title: 'User approved',
        message: 'The user has been approved.',
        variant: 'success',
      })
    } catch (error) {
      notify({
        title: 'Approval failed',
        message: error instanceof Error ? error.message : 'Could not approve this request.',
        variant: 'error',
      })
    }
  }

  const reject = async (requestId: string) => {
    if (!currentUser) return
    try {
      const base = resolveUsersListUrl().replace(/\/+$/, '')
      await apiClient.post(`${base}/${encodeURIComponent(requestId)}/reject`, {
        reason: rejectionReason || 'No reason supplied',
        approverUserId: currentUser.id,
        approverName: currentUser.name,
      })
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      notify({
        title: 'Request rejected',
        message: 'The request has been marked as rejected.',
        variant: 'info',
      })
      setRejectionReason('')
    } catch (error) {
      notify({
        title: 'Rejection failed',
        message: error instanceof Error ? error.message : 'Could not reject this request.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approve Users"
        description="Review and approve pending user onboarding requests."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/users/new')}>
              Add user
            </Button>
            <Button variant="secondary" onClick={() => navigate('/users')}>
              Back to users
            </Button>
          </>
        }
      />

      <Card className="space-y-4">
        {pendingQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        )}

        {pendingQuery.isError && (
          <ErrorState
            title="Unable to load pending requests"
            description={
              pendingQuery.error instanceof Error
                ? pendingQuery.error.message
                : 'Please try again.'
            }
            onRetry={() => pendingQuery.refetch()}
          />
        )}

        {pendingQuery.isSuccess && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Pending approvals</h3>
              <StatusPill
                label={`${pendingRequests.length} pending`}
                variant={pendingRequests.length > 0 ? 'warning' : 'success'}
              />
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No pending user requests.</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {request.firstName} {request.lastName} ({request.username})
                        </p>
                        <p className="text-xs text-slate-500">{request.email}</p>
                        <p className="text-xs text-slate-500">
                          Role: {roleDisplayName(request.role)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Submitted by {request.submittedBy} on{' '}
                          {new Date(request.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => approve(request.id)}>Approve</Button>
                        <Button variant="danger" onClick={() => reject(request.id)}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      {pendingQuery.isSuccess && pendingRequests.length > 0 && (
        <Card>
          <Input
            label="Rejection reason (used when clicking Reject)"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Missing required approvals or incorrect role selection."
          />
        </Card>
      )}
    </div>
  )
}
