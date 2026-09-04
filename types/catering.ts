export type CateringFlow = "instant" | "quote";

export type DietaryTag = "Vegetarian" | "Vegan Options" | "Gluten-Free Options" | "Halal Friendly";

export interface CateringRecommendation {
  largePizzas: number;
  sides: number;
  drinks: number;
  estimatedTotal: number;
  perPerson: number;
}

export interface CateringPackage {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  guestRange: string;
  totalPrice: number;
  perPerson: number;
  items: string[];
  dietaryTags: DietaryTag[];
  imageUrl: string;
  imageAlt: string;
}

export interface BulkMenuItem {
  id: string;
  slug: string;
  name: string;
  category: "pizzas" | "pasta" | "sides" | "salads";
  description: string;
  unitPrice: number;
  minQty: number;
  maxQty: number;
  dietaryTags: DietaryTag[];
  imageUrl: string;
  imageAlt: string;
}

export interface CateringQuoteFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  guestCount: number;
  eventDate: string;
  eventTime: string;
  deliveryAddress: string;
  dietaryNotes: string;
  requestInvoice: boolean;
  notes: string;
}

export interface CateringPolicy {
  question: string;
  answer: string;
}
