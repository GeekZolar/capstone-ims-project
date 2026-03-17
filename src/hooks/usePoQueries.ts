import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { poService } from '../services/poService'
import type { LocationCode } from '../types/po'

export const suppliersQueryKey = ['po', 'suppliers'] as const
export const warehousesQueryKey = (location: LocationCode) => ['po', 'warehouses', location] as const
export const purchaseOrderQueryKey = (id: string) => ['po', 'detail', id] as const

export function useSuppliers() {
  return useQuery({
    queryKey: suppliersQueryKey,
    queryFn: () => poService.getSuppliers(),
  })
}

export function useWarehousesByLocation(location: LocationCode | '') {
  return useQuery({
    queryKey: warehousesQueryKey(location || 'USA'),
    queryFn: () => poService.getWarehouses((location as LocationCode) || 'USA'),
    enabled: !!location,
  })
}

export function usePurchaseOrder(poId: string | undefined) {
  return useQuery({
    queryKey: purchaseOrderQueryKey(poId ?? ''),
    queryFn: () => poService.getPurchaseOrder(poId!),
    enabled: !!poId,
  })
}

export function useApprovePurchaseOrder(poId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => poService.approvePurchaseOrder(poId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKey(poId) })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}

export function useRejectPurchaseOrder(poId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload?: { reason?: string }) =>
      poService.rejectPurchaseOrder(poId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKey(poId) })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}

export function useRequestChangesPurchaseOrder(poId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload?: { comment?: string }) =>
      poService.requestChangesPurchaseOrder(poId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKey(poId) })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}
