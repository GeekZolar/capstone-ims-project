import { Activity, AlertCircle, Box, CheckCircle2, TrendingUp } from 'lucide-react'
import { useAlerts, useDashboardSummary } from '../hooks/useImsQueries'
import { Card } from '../components/common/Card'
import { KpiCard } from '../components/common/KpiCard'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { ErrorState } from '../components/common/ErrorState'
import { formatDate } from '../utils/format'
import { StatusPill } from '../components/common/StatusPill'

export const Dashboard = () => {
  const summaryQuery = useDashboardSummary()
  const alertsQuery = useAlerts()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time visibility into inventory health, approvals, and alerts."
      />

      {summaryQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`kpi-${index}`} className="h-24" />
          ))}
        </div>
      )}

      {summaryQuery.isError && (
        <ErrorState
          title="Unable to load dashboard"
          description="Please check your connection and try again."
          onRetry={() => summaryQuery.refetch()}
        />
      )}

      {summaryQuery.data && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total SKUs"
            value={summaryQuery.data.totalSkus.toString()}
            helper="Across all warehouses"
            icon={<Box className="h-5 w-5" />}
          />
          <KpiCard
            label="Low Stock SKUs"
            value={summaryQuery.data.lowStockSkus.toString()}
            helper="Below reorder point"
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <KpiCard
            label="Pending Approvals"
            value={summaryQuery.data.pendingApprovals.toString()}
            helper="Purchase orders"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <KpiCard
            label="Inventory Accuracy"
            value={`${summaryQuery.data.inventoryAccuracy}%`}
            helper="Weekly reconciliation"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Inventory Health</h3>
              <p className="text-sm text-slate-500">Stockout risk and expiring inventory overview.</p>
            </div>
            <StatusPill
              label={`${summaryQuery.data?.stockoutRisk ?? 0}% risk`}
              variant={(summaryQuery.data?.stockoutRisk ?? 0) > 10 ? 'warning' : 'success'}
            />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Low stock SKUs</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {summaryQuery.data?.lowStockSkus ?? '--'}
              </p>
              <p className="text-xs text-slate-500">Needs replenishment review</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Expiring lots</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {summaryQuery.data?.expiringLots ?? '--'}
              </p>
              <p className="text-xs text-slate-500">Within 120 days</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Forecast accuracy</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">87%</p>
              <p className="text-xs text-slate-500">Monthly rolling average</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-600" />
            <h3 className="text-base font-semibold text-slate-900">Alerts & Tasks</h3>
          </div>
          {alertsQuery.isLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`alert-${index}`} className="h-14" />
              ))}
            </div>
          ) : alertsQuery.isError ? (
            <ErrorState
              title="Unable to load alerts"
              description="Please try again."
              onRetry={() => alertsQuery.refetch()}
            />
          ) : (
            <div className="mt-4 space-y-3">
              {alertsQuery.data?.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{alert.description}</p>
                    </div>
                    <StatusPill
                      label={alert.severity}
                      variant={
                        alert.severity === 'critical'
                          ? 'danger'
                          : alert.severity === 'warning'
                            ? 'warning'
                            : 'info'
                      }
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
