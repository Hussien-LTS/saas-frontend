// types/api.ts

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── User (me) ────────────────────────────────────────────────────────────────

export type TenantPlan = 'FREE' | 'PRO' | 'ENTERPRISE';
export type TenantRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
}

export interface UserTenantMembership {
  role: TenantRole;
  tenant: TenantSummary;
}

export interface Me extends AuthUser {
  isEmailVerified: boolean;
  tenants: UserTenantMembership[];
}

// ─── Tenants ──────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  createdAt: string;
}

export interface TenantWithRole extends TenantSummary {
  role: TenantRole;
}

export interface TenantMember {
  role: TenantRole;
  user: {
    id: string;
    email: string;
    firstName: string;
  };
}

export interface TenantDetail extends Tenant {
  users: TenantMember[];
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface PlanLimits {
  members: number;
  projects: number;
}

export interface BillingPlan {
  id: string;
  name: string;
  plan: TenantPlan;
  limits: PlanLimits;
}
