import { useQuery } from '@tanstack/react-query'
import { imsService } from '../services/imsService'

export const useDashboardSummary = () =>
  useQuery({ queryKey: ['dashboard', 'summary'], queryFn: imsService.getDashboardSummary })

export const useAlerts = () =>
  useQuery({ queryKey: ['dashboard', 'alerts'], queryFn: imsService.getAlerts })

export const useWarehouses = () =>
  useQuery({ queryKey: ['warehouses'], queryFn: imsService.getWarehouses })

export const useInventory = () =>
  useQuery({ queryKey: ['inventory'], queryFn: imsService.getInventory })

export const usePurchaseOrders = () =>
  useQuery({ queryKey: ['purchase-orders'], queryFn: imsService.getPurchaseOrders })

export const useTransfers = () =>
  useQuery({ queryKey: ['transfers'], queryFn: imsService.getTransfers })

export const useForecasts = () =>
  useQuery({ queryKey: ['forecasts'], queryFn: imsService.getForecasts })
