import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { utilityService, type UtilityProductUpsertPayload } from '../services/utilityService'

export const productsQueryKey = ['utility', 'products'] as const
export const categoriesQueryKey = ['utility', 'categories'] as const

export function useProducts() {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: () => utilityService.getProducts(),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: () => utilityService.getCategories(),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UtilityProductUpsertPayload) => utilityService.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey })
    },
  })
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UtilityProductUpsertPayload) => utilityService.updateProduct(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey })
    },
  })
}

