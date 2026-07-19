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

export interface CrmTag {
  id: string;
  slug: string;
  label: string;
  color: string | null;
}

export interface CrmSegmentRules {
  minOrders?: number;
  minSpend?: number;
  lastOrderWithinDays?: number;
  lastOrderBeforeDays?: number;
  hasTags?: string[];
  missingTags?: string[];
  marketingEmailOptIn?: boolean;
  marketingSmsOptIn?: boolean;
}

export interface CrmSegment {
  id: string;
  name: string;
  description: string | null;
  rules: CrmSegmentRules;
  memberCount?: number;
}

export interface CrmCustomer {
  id: string;
  brandId: string;
  identityKey: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  notes: string | null;
  orderCount: number;
  totalSpent: string | number;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
  marketingEmailOptIn: boolean;
  marketingSmsOptIn: boolean;
  consentUpdatedAt: string | null;
  tags: CrmTag[];
  brand?: { id: string; slug: string; name: string };
  orders?: Array<{
    id: string;
    status: string;
    total: string | number;
    createdAt: string;
    paymentStatus: string;
    location?: { id: string; name: string };
  }>;
}

export interface CrmCustomerListResponse {
  brand: { id: string; slug: string; name: string };
  total: number;
  customers: CrmCustomer[];
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
