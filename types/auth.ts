export type UserRole = "USER" | "STAFF" | "MANAGER" | "ADMIN";

export type StoreMembershipRole = "PLATFORM_ADMIN" | "STORE_ADMIN" | "STAFF";

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
