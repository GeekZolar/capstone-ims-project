import type {
  AlertItem,
  DashboardSummary,
  ForecastItem,
  InventoryItem,
  PurchaseOrder,
  TransferOrder,
  Warehouse,
} from '../types/ims'

export const warehouses: Warehouse[] = [
  {
    id: 'wh-chi',
    code: 'CHI',
    name: 'Diamond Fulfillment',
    type: '3pl',
    country: 'USA',
    city: 'Chicago, IL',
    contactName: 'Aaron Miles',
    contactEmail: 'aaron@diamondwms.com',
  },
  {
    id: 'wh-tor',
    code: 'TOR',
    name: 'Kwiksave Warehouse',
    type: '3pl',
    country: 'Canada',
    city: 'Toronto, ON',
    contactName: 'Sasha Liao',
    contactEmail: 'sasha@kwiksave.com',
  },
  {
    id: 'wh-amz-usa',
    code: 'FBA-US',
    name: 'Amazon FBA USA',
    type: 'fba',
    country: 'USA',
    city: 'Richmond, CA',
    contactName: 'Amazon Ops',
    contactEmail: 'support@amazon.com',
  },
]

export const dashboardSummary: DashboardSummary = {
  totalSkus: 48,
  lowStockSkus: 7,
  expiringLots: 5,
  pendingApprovals: 3,
  inventoryAccuracy: 98.5,
  stockoutRisk: 12,
}

export const alerts: AlertItem[] = [
  {
    id: 'alert-1',
    type: 'stockout',
    title: 'Stockout risk detected',
    description: 'SKU OAT-ALM-MX is below reorder point in Chicago.',
    severity: 'critical',
    createdAt: '2026-02-08T09:10:00Z',
    actionLabel: 'Review recommendations',
  },
  {
    id: 'alert-2',
    type: 'expiry',
    title: 'Expiry alert in 120 days',
    description: 'Lot 24A-CHIA expires on 2026-06-06 (Toronto).',
    severity: 'warning',
    createdAt: '2026-02-08T08:05:00Z',
    actionLabel: 'View expiring lots',
  },
  {
    id: 'alert-3',
    type: 'approval',
    title: 'PO approval required',
    description: 'PO-1047 ready for approval (supplier: Andean Harvest).',
    severity: 'info',
    createdAt: '2026-02-08T07:30:00Z',
    actionLabel: 'Open approval queue',
  },
]

export const inventory: InventoryItem[] = [
  {
    sku: 'OAT-ALM-MX',
    name: 'Oat Almond Mix',
    category: 'Granola',
    uom: 'Case',
    lotNumber: '24A-CHIA',
    expiryDate: '2026-06-06',
    status: 'available',
    warehouseId: 'wh-chi',
    availableQty: 120,
    allocatedQty: 40,
    inTransitQty: 24,
  },
  {
    sku: 'ALM-CRNCH',
    name: 'Almond Crunch',
    category: 'Granola',
    uom: 'Case',
    lotNumber: '24B-ALM',
    expiryDate: '2026-07-18',
    status: 'available',
    warehouseId: 'wh-tor',
    availableQty: 60,
    allocatedQty: 20,
    inTransitQty: 10,
  },
  {
    sku: 'BLU-BRY',
    name: 'Blueberry Bites',
    category: 'Snacks',
    uom: 'Case',
    lotNumber: '24C-BRB',
    expiryDate: '2026-05-01',
    status: 'quarantined',
    warehouseId: 'wh-chi',
    availableQty: 0,
    allocatedQty: 0,
    inTransitQty: 0,
  },
  {
    sku: 'HNY-OAT',
    name: 'Honey Oats',
    category: 'Granola',
    uom: 'Case',
    lotNumber: '24D-HNY',
    expiryDate: '2026-04-15',
    status: 'available',
    warehouseId: 'wh-amz-usa',
    availableQty: 210,
    allocatedQty: 80,
    inTransitQty: 0,
  },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1047',
    poNumber: 'PO-1047',
    supplier: 'Andean Harvest',
    warehouseId: 'wh-chi',
    status: 'draft',
    currency: 'USD',
    orderDate: '2026-02-07',
    expectedDeliveryDate: '2026-03-05',
    totalValue: 18450,
    createdBy: 'Kathy Smith',
    lines: [
      {
        sku: 'OAT-ALM-MX',
        description: 'Oat Almond Mix',
        orderedQty: 240,
        receivedQty: 0,
        unitCost: 22.5,
      },
    ],
  },
  {
    id: 'po-1044',
    poNumber: 'PO-1044',
    supplier: 'Nordic Foods',
    warehouseId: 'wh-tor',
    status: 'approved',
    currency: 'CAD',
    orderDate: '2026-02-03',
    expectedDeliveryDate: '2026-02-28',
    totalValue: 10230,
    createdBy: 'Mary ONeill',
    approvedBy: 'Mary ONeill',
    lines: [
      {
        sku: 'ALM-CRNCH',
        description: 'Almond Crunch',
        orderedQty: 180,
        receivedQty: 0,
        unitCost: 18.2,
      },
    ],
  },
]

export const transferOrders: TransferOrder[] = [
  {
    id: 'tr-201',
    transferNumber: 'TR-201',
    sourceWarehouseId: 'wh-chi',
    destinationWarehouseId: 'wh-tor',
    status: 'in_transit',
    createdDate: '2026-02-02',
    expectedArrivalDate: '2026-02-10',
    items: [
      { sku: 'HNY-OAT', quantity: 50 },
      { sku: 'OAT-ALM-MX', quantity: 30 },
    ],
  },
]

export const forecasts: ForecastItem[] = [
  {
    sku: 'OAT-ALM-MX',
    forecastPeriod: 'Weekly',
    forecastedDemand: 140,
    overriddenDemand: 160,
    accuracyScore: 0.87,
    lastUpdated: '2026-02-07',
  },
  {
    sku: 'ALM-CRNCH',
    forecastPeriod: 'Weekly',
    forecastedDemand: 95,
    accuracyScore: 0.82,
    lastUpdated: '2026-02-07',
  },
]
