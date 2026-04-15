import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductForm, type ProductFormValues } from './ProductForm'
import { useProducts, useUpdateProduct } from '../hooks/useProductQueries'
import { ErrorState } from '../components/common/ErrorState'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton } from '../components/common/Skeleton'
import { getAxiosErrorMessage } from '../utils/apiError'

export const ProductEdit = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const productsQuery = useProducts()
  const updateMutation = useUpdateProduct(productId ?? '')

  const record = useMemo(() => {
    return (productsQuery.data ?? []).find((p) => p.productId === productId) ?? null
  }, [productsQuery.data, productId])

  if (!productId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit product" />
        <ErrorState title="Missing product id" description="Invalid route." />
      </div>
    )
  }

  if (productsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit product" description="Loading…" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (productsQuery.isError || !record) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit product" />
        <ErrorState
          title="Product not found"
          description="Unable to load this product. Please refresh and try again."
          onRetry={() => productsQuery.refetch()}
        />
      </div>
    )
  }

  const initial: ProductFormValues = {
    supplierId: record.supplierId ?? '',
    productName: record.productName ?? '',
    description: record.description ?? null,
    categoryId: record.categoryId ?? '',
    productSize: record.productSize ?? '',
    sku: record.sku ?? '',
    minOrderPallet: record.minOrderPallet ?? 0,
    casePerPallet: record.casePerPallet ?? 0,
    shelfLifeMonth: record.shelfLifeMonth ?? 0,
    isActive: Boolean(record.isActive),
    isSeasonal: Boolean(record.isSeasonal),
    seasonStartDate: record.seasonStartDate ?? null,
    seasonEndDate: record.seasonEndDate ?? null,
    countryCode: record.countryCode ?? '',
    note: record.note ?? null,
    warehouseId: '',
  }

  return (
    <ProductForm
      title="Update product"
      description="Update an existing product."
      initialValues={initial}
      submitLabel="Update product"
      isSubmitting={updateMutation.isPending}
      submitError={updateMutation.isError ? getAxiosErrorMessage(updateMutation.error) : null}
      onCancel={() => navigate('/products')}
      onSubmit={async (values) => {
        await updateMutation.mutateAsync({
          supplierId: values.supplierId,
          productName: values.productName,
          description: values.description ?? null,
          categoryId: values.categoryId,
          productSize: values.productSize,
          sku: values.sku,
          minOrderPallet: values.minOrderPallet,
          casePerPallet: values.casePerPallet,
          shelfLifeMonth: values.shelfLifeMonth,
          isActive: values.isActive,
          isSeasonal: values.isSeasonal,
          seasonStartDate: values.isSeasonal ? (values.seasonStartDate ?? null) : null,
          seasonEndDate: values.isSeasonal ? (values.seasonEndDate ?? null) : null,
          countryCode: values.countryCode,
          note: values.note ?? null,
        })
        navigate('/products')
      }}
    />
  )
}

