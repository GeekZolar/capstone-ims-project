import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'
import { StatusPill } from '../components/common/StatusPill'
import { useToast } from '../components/common/Toast'

const recommendations = [
  {
    id: 'rec-1',
    sku: 'OAT-ALM-MX',
    warehouse: 'Diamond Fulfillment',
    recommendedQty: 240,
    reason: 'Below reorder point, 4-week lead time',
    type: 'purchase',
  },
  {
    id: 'rec-2',
    sku: 'ALM-CRNCH',
    warehouse: 'Kwiksave Warehouse',
    recommendedQty: 50,
    reason: 'Excess in Chicago, transfer recommended',
    type: 'transfer',
  },
]

export const Replenishment = () => {
  const { notify } = useToast()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Replenishment"
        description="Review reorder recommendations based on forecasts, lead times, and safety stock."
        actions={<Button variant="secondary">Run daily check</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">SKU</p>
                <p className="text-lg font-semibold text-slate-900">{rec.sku}</p>
              </div>
              <StatusPill
                label={rec.type === 'purchase' ? 'Purchase' : 'Transfer'}
                variant={rec.type === 'purchase' ? 'warning' : 'info'}
              />
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Destination: {rec.warehouse}</p>
              <p>Recommended Qty: {rec.recommendedQty}</p>
              <p>Reason: {rec.reason}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  notify({
                    title: 'Recommendation queued',
                    message: `${rec.sku} added to draft order.`,
                    variant: 'success',
                  })
                }
              >
                Accept
              </Button>
              <Button variant="secondary">Edit</Button>
              <Button variant="ghost">Dismiss</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
