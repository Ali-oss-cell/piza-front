export type UserRole = "USER" | "STAFF" | "MANAGER" | "ADMIN";

export type StoreMembershipRole = "PLATFORM_ADMIN" | "STORE_ADMIN" | "STAFF" | "SEO";

export interface AuthStoreLocation {
  id: string;
  slug: string;
  name: string;
  isDefault: boolean;
}

export interface AuthStore {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  primaryColor?: string | null;
  membershipRole: StoreMembershipRole | string;
  locations: AuthStoreLocation[];
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  stores?: AuthStore[];
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export function isPlatformAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  return (user.stores ?? []).some(
    (store) => store.membershipRole === "PLATFORM_ADMIN",
  );
}

export function canAccessAdminDashboard(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN" || user.role === "MANAGER") {
    return true;
  }

  return (user.stores ?? []).some((store) =>
    ["PLATFORM_ADMIN", "STORE_ADMIN"].includes(store.membershipRole),
  );
}

export function canAccessSeoDashboard(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN" || user.role === "MANAGER") {
    return true;
  }

  return (user.stores ?? []).some((store) =>
    ["PLATFORM_ADMIN", "STORE_ADMIN", "SEO"].includes(store.membershipRole),
  );
}

/** True when the user only has SEO membership (no store/platform admin). */
export function isSeoOnlyUser(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false;
  }
  if (user.role === "ADMIN" || user.role === "MANAGER") {
    return false;
  }
  const stores = user.stores ?? [];
  if (stores.length === 0) {
    return false;
  }
  return stores.every((store) => store.membershipRole === "SEO");
}

export function seoAccessLabel(user: AuthUser | null | undefined): string {
  if (!user) return "Guest";
  if (isPlatformAdmin(user)) return "Platform admin";
  if (canAccessAdminDashboard(user)) return "Store admin";
  if (isSeoOnlyUser(user)) return "SEO editor";
  if (canAccessSeoDashboard(user)) return "SEO access";
  return user.role;
}
