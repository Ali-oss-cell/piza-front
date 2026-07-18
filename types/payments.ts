export type StorePaymentProvider = "NONE" | "CASH" | "STRIPE" | "LINKLY";

export interface StoreDomain {
  id: string;
  host: string | null;
  pathPrefix: string | null;
  isPrimary: boolean;
  isActive: boolean;
  locationId: string | null;
}

export interface PaymentSettings {
  storeId: string;
  storeSlug: string;
  provider: StorePaymentProvider;
  cashEnabled: boolean;
  cardTerminalEnabled: boolean;
  cardOnlineEnabled: boolean;
  stripePublishableKey: string | null;
  hasStripeSecretRef: boolean;
  hasStripeWebhookSecretRef: boolean;
  linklyUsername: string | null;
  hasLinklySecretRef: boolean;
  location: {
    id: string;
    slug: string;
    name: string;
    stripeTerminalLocationId: string | null;
    stripeTerminalReaderId: string | null;
  } | null;
}

export interface UpdatePaymentSettingsPayload {
  provider?: StorePaymentProvider;
  cashEnabled?: boolean;
  cardTerminalEnabled?: boolean;
  cardOnlineEnabled?: boolean;
  stripePublishableKey?: string | null;
  stripeSecretKeyRef?: string | null;
  stripeWebhookSecretRef?: string | null;
  stripeTerminalLocationId?: string | null;
  stripeTerminalReaderId?: string | null;
  locationId?: string;
}
