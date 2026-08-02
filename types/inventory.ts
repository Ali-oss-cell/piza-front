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
  | "SALE";

export type InventoryTab =
  | "stock-list"
  | "receive"
  | "waste"
  | "adjust"
  | "count"
  | "low-stock"
  | "history"
  | "recipes";

export const INVENTORY_TAB_LABELS: Record<InventoryTab, string> = {
  "stock-list": "Stock list",
  receive: "Receive",
  waste: "Waste",
  adjust: "Adjust",
  count: "Count",
  "low-stock": "Low stock",
  history: "History",
  recipes: "Recipes",
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
}

export interface MenuItemRecipe {
  menuItemId: string;
  menuItemName: string;
  menuItemNumber: number;
  categorySlug: string;
  lines: RecipeLine[];
}

export interface ReplaceRecipePayload {
  lines: Array<{ stockItemId: string; qtyPerUnit: number }>;
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
};
