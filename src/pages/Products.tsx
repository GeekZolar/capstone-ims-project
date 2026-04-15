import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { Table, TableCell, TableHeader, TableRow } from '../components/common/Table'
import { StatusPill } from '../components/common/StatusPill'
import { useProducts } from '../hooks/useProductQueries'
import { useSuppliers } from '../hooks/usePoQueries'

export const Products = () => {
  const navigate = useNavigate()
  const productsQuery = useProducts()
  const suppliersQuery = useSuppliers()

  const supplierNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of suppliersQuery.data ?? []) {
      map.set(String(s.id), s.companyName)
    }
    return map
  }, [suppliersQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="View, add, and update available products."
        actions={
          <Button type="button" onClick={() => navigate('/products/new')}>
            Add product
          </Button>
        }
      />

      {productsQuery.isLoading ? (
        <Skeleton className="h-64" />
      ) : productsQuery.isError ? (
        <ErrorState
          title="Products unavailable"
          description="Please try again."
          onRetry={() => productsQuery.refetch()}
        />
      ) : (productsQuery.data ?? []).length === 0 ? (
        <EmptyState title="No products" description="Add a product to get started." />
      ) : (
        <Card className="p-0">
          <Table>
            <table className="w-full text-left">
              <TableHeader>
                <TableRow>
                  <TableCell className="text-xs font-semibold text-slate-500">Product</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500">SKU</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500">Supplier</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500">Country</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500">Active</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {(productsQuery.data ?? []).map((p) => {
                  const supplierLabel =
                    supplierNameById.get(String(p.supplierId)) ?? String(p.supplierId)
                  return (
                    <TableRow key={p.productId}>
                      <TableCell className="font-semibold text-slate-900">
                        {p.productSize ? `${p.productName} - ${p.productSize}` : p.productName}
                      </TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{supplierLabel}</TableCell>
                      <TableCell>{p.countryCode}</TableCell>
                      <TableCell>
                        <StatusPill label={p.isActive ? 'Active' : 'Inactive'} variant={p.isActive ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          className="cursor-pointer rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                          onClick={() => navigate(`/products/${p.productId}/edit`)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </tbody>
            </table>
          </Table>
        </Card>
      )}
    </div>
  )
}

