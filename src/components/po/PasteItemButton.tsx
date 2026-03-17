import type { PurchaseOrderLineItem } from '../../types/po'
import { createEmptyLineItem, computeLineAmount } from '../../services/poService'

interface PasteItemButtonProps {
  onPaste: (items: PurchaseOrderLineItem[]) => void
  disabled?: boolean
  children?: React.ReactNode
}

function parseClipboardTable(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((row) => row.split(/\t/).map((cell) => cell.trim()))
}

function parsePastedItems(rows: string[][]): PurchaseOrderLineItem[] {
  const items: PurchaseOrderLineItem[] = []
  const header = rows[0] ?? []
  const dataRows = rows.slice(1).filter((row) => row.some((c) => c !== ''))

  const idx = (name: string) => {
    const index = header.findIndex(
      (h) => h.toLowerCase().replace(/\s+/g, '') === name.toLowerCase().replace(/\s+/g, ''),
    )
    return index >= 0 ? index : -1
  }
  const productIdx = idx('productname') >= 0 ? idx('productname') : idx('product') >= 0 ? idx('product') : 1
  const descIdx = idx('description') >= 0 ? idx('description') : 2
  const qtyIdx = idx('quantity') >= 0 ? idx('quantity') : 3
  const rateIdx = idx('rate') >= 0 ? idx('rate') : 4
  const amountIdx = idx('amount') >= 0 ? idx('amount') : 5

  dataRows.forEach((row) => {
    const productName = row[productIdx] ?? ''
    const description = row[descIdx] ?? ''
    const quantity = Number.parseFloat(String(row[qtyIdx] ?? 0).replace(/,/g, '')) || 0
    const rate = Number.parseFloat(String(row[rateIdx] ?? 0).replace(/,/g, '')) || 0
    const amount = row[amountIdx]
      ? Number.parseFloat(String(row[amountIdx]).replace(/,/g, '')) || 0
      : computeLineAmount(quantity, rate)

    if (!productName && !description && quantity === 0 && rate === 0) return

    items.push({
      ...createEmptyLineItem(),
      productName,
      description,
      quantity,
      rate,
      amount,
    })
  })

  return items
}

export function PasteItemButton({ onPaste, disabled, children }: PasteItemButtonProps) {
  const handleClick = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const rows = parseClipboardTable(text)
      if (rows.length < 2) return
      const items = parsePastedItems(rows)
      if (items.length) onPaste(items)
    } catch {
      // Clipboard read denied or parse failed
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2 text-[rgb(var(--muted))] hover:bg-[rgb(var(--bg-muted))] hover:text-[rgb(var(--text))] disabled:cursor-not-allowed disabled:opacity-50"
      title="Paste line items from Excel"
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      )}
    </button>
  )
}
