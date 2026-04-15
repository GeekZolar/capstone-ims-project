import { useNavigate } from 'react-router-dom'
import { ProductForm, type ProductFormValues } from './ProductForm'
import { useCreateProduct } from '../hooks/useProductQueries'
import { getAxiosErrorMessage } from '../utils/apiError'

const initial: ProductFormValues = {
  supplierId: '',
  productName: '',
  description: null,
  categoryId: '',
  productSize: '',
  sku: '',
  minOrderPallet: 0,
  casePerPallet: 0,
  shelfLifeMonth: 0,
  isActive: true,
  isSeasonal: false,
  seasonStartDate: null,
  seasonEndDate: null,
  countryCode: '',
  note: null,
  warehouseId: '',
}

export const ProductCreate = () => {
  const navigate = useNavigate()
  const createMutation = useCreateProduct()

  return (
    <ProductForm
      title="Add product"
      description="Create a new product in the catalog."
      initialValues={initial}
      submitLabel="Create product"
      isSubmitting={createMutation.isPending}
      submitError={createMutation.isError ? getAxiosErrorMessage(createMutation.error) : null}
      onCancel={() => navigate('/products')}
      onSubmit={async (values) => {
        await createMutation.mutateAsync({
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

