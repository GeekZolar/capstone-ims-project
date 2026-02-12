import {
  alerts,
  dashboardSummary,
  forecasts,
  inventory,
  purchaseOrders,
  transferOrders,
  warehouses,
} from '../data/mockData'
import type {
  AlertItem,
  DashboardSummary,
  ForecastItem,
  InventoryItem,
  PurchaseOrder,
  TransferOrder,
  Warehouse,
} from '../types/ims'

const simulateNetwork = async <T>(data: T, delay = 700): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, delay))
  return data
}

export const imsService = {
  getDashboardSummary(): Promise<DashboardSummary> {
    return simulateNetwork(dashboardSummary, 500)
  },
  getAlerts(): Promise<AlertItem[]> {
    return simulateNetwork(alerts, 600)
  },
  getWarehouses(): Promise<Warehouse[]> {
    return simulateNetwork(warehouses, 450)
  },
  getInventory(): Promise<InventoryItem[]> {
    return simulateNetwork(inventory, 800)
  },
  getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return simulateNetwork(purchaseOrders, 850)
  },
  getTransfers(): Promise<TransferOrder[]> {
    return simulateNetwork(transferOrders, 750)
  },
  getForecasts(): Promise<ForecastItem[]> {
    return simulateNetwork(forecasts, 650)
  },
}
