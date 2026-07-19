export interface HqReadinessCheck {
  key: string;
  label: string;
  complete: boolean;
}

export interface HqReadiness {
  percentComplete: number;
  completed: number;
  total: number;
  checks: HqReadinessCheck[];
  brand?: {
    id: string;
    slug: string;
    name: string;
    status: string;
    isActive: boolean;
  };
}

export interface HqStoreRow {
  id: string;
  slug: string;
  name: string;
  status: "DRAFT" | "LIVE";
  isActive: boolean;
  primaryHost: string | null;
  primaryPath: string | null;
  locations: number;
  menuItemCount: number;
  paymentProvider: string;
  cardEnabled: boolean;
  revenue: number;
  orders: number;
  liveOrders: number;
  alerts: string[];
}

export interface HqOverview {
  range: { from: string; to: string; timezone?: string };
  totals: {
    storeCount: number;
    activeStoreCount: number;
    suspendedStoreCount: number;
    revenue: number;
    orders: number;
    liveOrders: number;
    alerts: number;
    averageOrderValue: number;
  };
  stores: HqStoreRow[];
}

export interface HqSalesReport {
  range: { from: string; to: string; timezone?: string };
  store: { slug: string; name: string } | null;
  totals: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
  };
  byStore: Array<{
    slug: string;
    name: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }>;
  days: Array<{ date: string; revenue: number; orders: number }>;
  paymentMix: Array<{ method: string; revenue: number; orders: number }>;
  channelMix: Array<{ channel: string; revenue: number; orders: number }>;
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
  name: string | null;
  email: string | null;
  phone: string | null;
  orderCount: number;
  lastOrderAt: string | null;
  brands?: string[];
  totalSpent?: number;
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
  store?: { id: string; slug: string; name: string };
}

export interface HqStoreHealthRow {
  id: string;
  slug: string;
  name: string;
  status: string;
  isActive: boolean;
  severity: "ok" | "warning" | "critical";
  alerts: Array<{ code: string; message: string; severity: "warning" | "critical" }>;
}

export interface HqStoreHealth {
  totals: {
    stores: number;
    healthy: number;
    warning: number;
    critical: number;
    alerts: number;
  };
  stores: HqStoreHealthRow[];
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
