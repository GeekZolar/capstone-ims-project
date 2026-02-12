export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)

export const formatCurrency = (value: number, currency: 'USD' | 'CAD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  )
