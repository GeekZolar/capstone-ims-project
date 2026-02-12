import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { StatusPill } from '../components/common/StatusPill'

const users = [
  { id: 'u1', name: 'Kathy Smith', role: 'System Administrator', status: 'Active' },
  { id: 'u2', name: "Mary O'Neill", role: 'PO Approver', status: 'Active' },
  { id: 'u3', name: 'John Wheeler', role: 'Inventory Manager', status: 'Active' },
]

export const Users = () => (
  <div className="space-y-6">
    <PageHeader
      title="Users & Access"
      description="Manage user accounts, roles, and access policies."
      actions={<Button>Add user</Button>}
    />

    <Card className="space-y-4">
      <div className="grid gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill label={user.status} variant="success" />
              <Button variant="secondary">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
)
