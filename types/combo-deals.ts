export type ComboSlotSourceType = "CATEGORY" | "ITEM";

export interface ComboDealSlot {
  id: string;
  label: string;
  sortOrder: number;
  quantity: number;
  sourceType: ComboSlotSourceType;
  categorySlug: string | null;
  menuItemId: string | null;
  allowedSizes: string[] | null;
  allowModifiers: boolean;
  menuItem?: {
    id: string;
    name: string;
    slug: string;
    categorySlug: string;
    price: string | number;
    imageUrl: string;
    isActive: boolean;
  } | null;
}

export interface ComboDeal {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string | null;
  bundlePrice: string | number;
  sortOrder: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  slots: ComboDealSlot[];
}

export interface ComboDealSlotPayload {
  id?: string;
  label: string;
  sortOrder?: number;
  quantity?: number;
  sourceType: ComboSlotSourceType;
  categorySlug?: string;
  menuItemId?: string;
  allowedSizes?: string[];
  allowModifiers?: boolean;
}

export interface CreateComboDealPayload {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  bundlePrice: number;
  sortOrder?: number;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  slots: ComboDealSlotPayload[];
}

export type UpdateComboDealPayload = Partial<CreateComboDealPayload>;
