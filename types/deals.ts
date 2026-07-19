export type DealDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Deal {
  id: string;
  slug: string;
  title: string;
  description: string;
  badgeLabel?: string | null;
  discountType: DealDiscountType;
  discountValue: string | number;
  promoCode?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  termsNote?: string | null;
  ctaLabel: string;
  ctaHref: string;
  validFrom?: string | null;
  validUntil?: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  scope?: "STORE" | "PLATFORM";
}

export interface CreateDealPayload {
  slug: string;
  title: string;
  description: string;
  badgeLabel?: string;
  discountType: DealDiscountType;
  discountValue: number;
  promoCode?: string;
  imageUrl?: string;
  imageAlt?: string;
  termsNote?: string;
  ctaLabel?: string;
  ctaHref?: string;
  validFrom?: string;
  validUntil?: string;
  sortOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export type UpdateDealPayload = Partial<CreateDealPayload>;

export function formatDealDiscount(deal: Deal): string {
  const value = Number(deal.discountValue);

  if (deal.discountType === "PERCENTAGE") {
    return `${value % 1 === 0 ? value : value.toFixed(0)}% off`;
  }

  return `$${value.toFixed(value % 1 === 0 ? 0 : 2)} off`;
}

export function formatDealBadge(deal: Deal): string {
  if (deal.badgeLabel?.trim()) {
    return deal.badgeLabel.trim();
  }

  return formatDealDiscount(deal);
}
