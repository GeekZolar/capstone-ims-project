import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'

const reports = [
  {
    title: 'Current Inventory Report',
    description: 'Real-time inventory by SKU and location with status breakdowns.',
    frequency: 'On-demand',
  },
  {
    title: 'Projected Inventory Report',
    description: 'Inventory levels after pending orders and allocations are applied.',
    frequency: 'Daily',
  },
  {
    title: 'Inventory Valuation',
    description: 'Monthly valuation synced from QuickBooks with variance analysis.',
    frequency: 'Monthly',
  },
  {
    title: 'Expiry Alert Report',
    description: 'Lots approaching expiry within 120 days and recommended actions.',
    frequency: 'Daily',
  },
]

export const Reports = () => (
  <div className="space-y-6">
    <PageHeader
      title="Reports"
      description="Generate operational and financial reports with export options."
    />

    <div className="grid gap-4 lg:grid-cols-2">
      {reports.map((report) => (
        <Card key={report.title} className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{report.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{report.description}</p>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Frequency: {report.frequency}</span>
            <div className="flex gap-2">
              <Button variant="secondary">Export PDF</Button>
              <Button variant="secondary">Export Excel</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)
