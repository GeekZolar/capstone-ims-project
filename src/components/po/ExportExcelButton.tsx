import * as XLSX from 'xlsx'
import type { PurchaseOrderLineItem } from '../../types/po'

interface ExportExcelButtonProps {
  items: PurchaseOrderLineItem[]
  disabled?: boolean
  children?: React.ReactNode
}

export function ExportExcelButton({ items, disabled, children }: ExportExcelButtonProps) {
  const handleExport = () => {
    const rows = items.map((item, index) => ({
      No: index + 1,
      'Product Name': item.productName,
      Description: item.description,
      Quantity: item.quantity,
      Rate: item.rate,
      Amount: item.amount,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Line Items')
    XLSX.writeFile(wb, `po-line-items-${Date.now()}.xlsx`)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg-muted))] hover:text-[rgb(var(--text))] disabled:cursor-not-allowed disabled:opacity-50"
      title="Export to Excel"
    >
      {children ?? (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5M17 14v2m0 2v-2m0 2h2m-2 0h-2"
          />
        </svg>
      )}
    </button>
  )
}
