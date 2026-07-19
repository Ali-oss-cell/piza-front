export interface HqReadinessCheck {
  id: string;
  label: string;
  done: boolean;
}

export interface HqReadiness {
  percent: number;
  checks: HqReadinessCheck[];
  ready: boolean;
}

export interface HqStoreRow {
  brandId: string;
  slug: string;
  name: string;
  status: "DRAFT" | "LIVE";
  isActive: boolean;
  primaryColor: string | null;
  pathPrefix: string | null;
  logoUrl: string | null;
  locationCount: number;
  menuItemCount: number;
  hasHours: boolean;
  hasAddress: boolean;
  revenue: number;
  orderCount: number;
  liveOrders: number;
  lastOrderAt: string | null;
  payment: {
    cashEnabled: boolean;
    cardTerminalEnabled: boolean;
    cardOnlineEnabled: boolean;
    provider: string;
  };
  readiness: HqReadiness;
}

export interface HqOverview {
  period: { from: string; to: string };
  totals: {
    revenue: number;
    orderCount: number;
    averageOrderValue: number;
    liveOrders: number;
    activeStores: number;
    activeLocations: number;
  };
  byStore: HqStoreRow[];
  recentOrders: Array<{
    id: string;
    brandSlug: string;
    brandName: string;
    total: number;
    status: string;
    paymentStatus: string;
    channel: string;
    createdAt: string;
    customerName: string;
  }>;
  alerts: Array<{ type: string; brandSlug: string; message: string }>;
}

export interface HqSalesReport {
  period: { from: string; to: string };
  daily: Array<{ date: string; revenue: number; orderCount: number }>;
  byChannel: Array<{ channel: string; revenue: number; orderCount: number }>;
  byPaymentMethod: Array<{
    paymentMethod: string;
    revenue: number;
    orderCount: number;
  }>;
  byStore: Array<{
    slug: string;
    name: string;
    revenue: number;
    orderCount: number;
  }>;
  totals: { revenue: number; orderCount: number };
}

export interface HqDomain {
  id: string;
  host: string | null;
  pathPrefix: string | null;
  isPrimary: boolean;
  isActive: boolean;
  store: { id: string; slug: string; name: string; isActive: boolean };
  location: { id: string; slug: string; name: string } | null;
}

export interface HqMenuTemplate {
  id: string;
  name: string;
  description: string | null;
  sourceBrandId: string | null;
  createdAt: string;
  sourceBrand: { id: string; slug: string; name: string } | null;
}

export interface HqCustomer {
  key: string;
  name: string;
  email: string | null;
  phone: string | null;
  orderCount: number;
  lastOrderAt: string;
  brands: string[];
}

export interface HqAuditEvent {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  store: { id: string; slug: string; name: string } | null;
}

export interface TeamMembership {
  id: string;
  role: string;
  isActive: boolean;
  locationId: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  location: { id: string; slug: string; name: string } | null;
}

export interface AdminLocation {
  id: string;
  slug: string;
  name: string;
  suburb: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  deliveryFee: string | number;
  minOrderAmount: string | number;
  openingHours: unknown;
  isActive: boolean;
  isDefault: boolean;
}
