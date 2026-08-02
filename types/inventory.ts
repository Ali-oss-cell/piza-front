export type StockUnit =
  | "EACH"
  | "KG"
  | "G"
  | "L"
  | "ML"
  | "CARTON"
  | "PACK"
  | "BAG";

export type StockMovementType =
  | "RECEIVE"
  | "ADJUST"
  | "WASTE"
  | "COUNT"
  | "SALE"
  | "REFUND";

export type InventoryTab =
  | "stock-list"
  | "receive"
  | "waste"
  | "adjust"
  | "count"
  | "low-stock"
  | "history"
  | "statistics"
  | "recipes"
  | "suppliers"
  | "purchase-orders";

export const INVENTORY_TAB_LABELS: Record<InventoryTab, string> = {
  "stock-list": "Stock list",
  receive: "Receive",
  waste: "Waste",
  adjust: "Adjust",
  count: "Count",
  "low-stock": "Low stock",
  history: "History",
  statistics: "Statistics",
  recipes: "Recipes",
  suppliers: "Suppliers",
  "purchase-orders": "Purchase orders",
};

export type RecipeSizeKey = "" | "small" | "large" | "family";

export const RECIPE_SIZE_KEYS: Array<{
  key: RecipeSizeKey;
  label: string;
}> = [
  { key: "", label: "Default" },
  { key: "small", label: "Small" },
  { key: "large", label: "Large" },
  { key: "family", label: "Family" },
];

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIAL"
  | "RECEIVED"
  | "CANCELLED";

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> =
  {
    DRAFT: "Draft",
    SENT: "Sent",
    PARTIAL: "Partial",
    RECEIVED: "Received",
    CANCELLED: "Cancelled",
  };

export interface StockItem {
  id: string;
  brandId: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: StockUnit;
  qtyOnHand: string;
  lowStockAt: string | null;
  costPerUnit: string | null;
  notes: string | null;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  stockItemName?: string;
  stockItemUnit?: string;
  brandId: string;
  type: StockMovementType;
  deltaQty: string;
  qtyAfter: string;
  reason: string | null;
  unitCost: string | null;
  receivedAt: string | null;
  orderId: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
}

export interface InventorySummary {
  totalItems: number;
  activeItems: number;
  lowStockCount: number;
}

export interface CreateStockItemPayload {
  name: string;
  sku?: string | null;
  category?: string | null;
  unit?: StockUnit;
  qtyOnHand?: number;
  lowStockAt?: number | null;
  costPerUnit?: number | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface UpdateStockItemPayload {
  name?: string;
  sku?: string | null;
  category?: string | null;
  unit?: StockUnit;
  lowStockAt?: number | null;
  costPerUnit?: number | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface CreateStockMovementPayload {
  type: StockMovementType;
  qty?: number;
  countedQty?: number;
  unitCost?: number;
  receivedAt?: string;
  reason?: string | null;
}

export interface RecipeLine {
  id: string;
  stockItemId: string;
  stockItemName: string;
  stockItemUnit: string;
  qtyPerUnit: string;
  sizeKey: string;
}

export interface MenuItemRecipe {
  menuItemId: string;
  menuItemName: string;
  menuItemNumber: number;
  categorySlug: string;
  lines: RecipeLine[];
}

export interface ToppingRecipe {
  toppingId: string;
  toppingLabel: string;
  categorySlug: string;
  lines: RecipeLine[];
}

export interface CrustRecipe {
  crustOptionId: string;
  crustLabel: string;
  lines: RecipeLine[];
}

export interface ReplaceRecipePayload {
  lines: Array<{
    stockItemId: string;
    qtyPerUnit: number;
    sizeKey?: string;
  }>;
}

export interface Supplier {
  id: string;
  brandId: string;
  name: string;
  phone: string | null;
  email: string | null;
  abn: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierPayload {
  name: string;
  phone?: string | null;
  email?: string | null;
  abn?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface UpdateSupplierPayload {
  name?: string;
  phone?: string | null;
  email?: string | null;
  abn?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface PurchaseOrderLine {
  id: string;
  stockItemId: string;
  stockItemName: string;
  stockItemUnit: string;
  qtyOrdered: string;
  qtyReceived: string;
  unitCost: string;
  lineTotal: string;
}

export interface PurchaseOrder {
  id: string;
  brandId: string;
  number: number;
  status: PurchaseOrderStatus;
  supplierId: string;
  supplierName: string;
  orderedAt: string;
  expectedAt: string | null;
  receivedAt: string | null;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  lines: PurchaseOrderLine[];
  total: string;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  expectedAt?: string | null;
  notes?: string | null;
  lines: Array<{
    stockItemId: string;
    qtyOrdered: number;
    unitCost: number;
  }>;
}

export interface UpdatePurchaseOrderPayload {
  supplierId?: string;
  expectedAt?: string | null;
  notes?: string | null;
  lines?: Array<{
    stockItemId: string;
    qtyOrdered: number;
    unitCost: number;
  }>;
}

export interface ReceivePurchaseOrderPayload {
  lines?: Array<{ lineId: string; qty: number }>;
  receivedAt?: string;
}

export interface InventoryStatsKpis {
  soldQty: number;
  soldCostEst: number;
  wasteQty: number;
  wasteCostEst: number;
  receiveQty: number;
  receiveCost: number;
  refundQty: number;
  netChange: number;
  lowStockCount: number;
  ordersTouched: number;
}

export interface InventoryStatsDailyRow {
  date: string;
  soldQty: number;
  wasteQty: number;
  receiveQty: number;
  receiveCost: number;
}

export interface InventoryStatsSkuRow {
  stockItemId: string;
  name: string;
  qty: number;
  costEst: number;
}

export interface InventoryStats {
  range: { from: string; to: string };
  previousRange: { from: string; to: string };
  kpis: InventoryStatsKpis;
  previousKpis: InventoryStatsKpis;
  daily: InventoryStatsDailyRow[];
  topSold: InventoryStatsSkuRow[];
  topWaste: InventoryStatsSkuRow[];
}

export const STOCK_UNIT_LABELS: Record<StockUnit, string> = {
  EACH: "each",
  KG: "kg",
  G: "g",
  L: "L",
  ML: "mL",
  CARTON: "carton",
  PACK: "pack",
  BAG: "bag",
};

export const STOCK_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  RECEIVE: "Receive",
  ADJUST: "Adjust",
  WASTE: "Waste",
  COUNT: "Count",
  SALE: "Sale",
  REFUND: "Refund",
};
