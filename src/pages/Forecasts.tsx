import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { Table, TableCell, TableHeader, TableRow } from '../components/common/Table'
import { useForecasts } from '../hooks/useImsQueries'
import { formatDate, formatNumber } from '../utils/format'

export const Forecasts = () => {
  const forecastsQuery = useForecasts()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecasts"
        description="Review demand forecasts, overrides, and accuracy tracking."
        actions={
          <>
            <Button variant="secondary">Upload promo calendar</Button>
            <Button>Generate forecast</Button>
          </>
        }
      />

      <Card className="text-sm text-slate-600">
        Forecasts are recalculated weekly using 12+ months of sales history with seasonal adjustments.
      </Card>

      {forecastsQuery.isLoading ? (
        <Skeleton className="h-56" />
      ) : forecastsQuery.isError ? (
        <ErrorState
          title="Forecasts unavailable"
          description="Please try again."
          onRetry={() => forecastsQuery.refetch()}
        />
      ) : forecastsQuery.data?.length === 0 ? (
        <EmptyState title="No forecasts" description="Generate forecasts to get started." />
      ) : (
        <Table>
          <table className="w-full text-left">
            <TableHeader>
              <TableRow>
                <TableCell className="text-xs font-semibold text-slate-500">SKU</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Period</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">System</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Override</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Accuracy</TableCell>
                <TableCell className="text-xs font-semibold text-slate-500">Updated</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {forecastsQuery.data?.map((forecast) => (
                <TableRow key={forecast.sku}>
                  <TableCell className="font-semibold text-slate-900">{forecast.sku}</TableCell>
                  <TableCell>{forecast.forecastPeriod}</TableCell>
                  <TableCell>{formatNumber(forecast.forecastedDemand)}</TableCell>
                  <TableCell>
                    {forecast.overriddenDemand
                      ? formatNumber(forecast.overriddenDemand)
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {forecast.accuracyScore
                      ? `${Math.round(forecast.accuracyScore * 100)}%`
                      : '—'}
                  </TableCell>
                  <TableCell>{formatDate(forecast.lastUpdated)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </table>
        </Table>
      )}
    </div>
  )
}
