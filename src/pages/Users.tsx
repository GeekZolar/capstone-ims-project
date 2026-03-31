import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { StatusPill } from '../components/common/StatusPill'
import { userService } from '../services/userService'
import { roleDisplayName, type UserListItem } from '../types/ims'
import { mapUserApiRecordToListItem } from '../utils/userApiMappers'

function statusPillProps(status: UserListItem['accountStatus']) {
  switch (status) {
    case 'inactive':
      return { label: 'Inactive', variant: 'danger' as const }
    case 'pending':
      return { label: 'Pending', variant: 'warning' as const }
    default:
      return { label: 'Active', variant: 'success' as const }
  }
}

export const Users = () => {
  const navigate = useNavigate()
  const usersQuery = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const res = await userService.fetchUsers()
      return res.data.map(mapUserApiRecordToListItem)
    },
  })

  const pendingApprovalUsers = useMemo(
    () => usersQuery.data?.filter((u) => u.accountStatus === 'pending') ?? [],
    [usersQuery.data],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Access"
        description="Manage user accounts and admin approval workflow."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/users/approve')}>
              Approve users ({pendingApprovalUsers.length})
            </Button>
            <Button onClick={() => navigate('/users/new')}>Add user</Button>
          </>
        }
      />

      <Card className="space-y-4">
        {usersQuery.isLoading && (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] rounded-xl" />
            ))}
          </div>
        )}

        {usersQuery.isError && (
          <ErrorState
            title="Unable to load users"
            description={usersQuery.error instanceof Error ? usersQuery.error.message : 'Please try again.'}
            onRetry={() => usersQuery.refetch()}
          />
        )}

        {usersQuery.isSuccess && usersQuery.data.length === 0 && (
          <EmptyState
            title="No users found"
            description="There are no users returned from the server yet."
          />
        )}

        {usersQuery.isSuccess && usersQuery.data.length > 0 && (
          <div className="grid gap-3">
            {usersQuery.data.map((user) => {
              const pill = statusPillProps(user.accountStatus)
              return (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">
                      {user.roleName || roleDisplayName(user.roleAlt)}
                      {user.email ? ` | ${user.email}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill label={pill.label} variant={pill.variant} />
                    <Button variant="secondary">Edit</Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
