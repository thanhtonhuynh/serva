import type { Session } from "@serva/database";
import type { PermissionCode, Role } from "./rbac";

export type Identity = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  accountStatus: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPlatformAdmin: boolean;
  companyCount: number;
};

export type Operator = {
  id: string;
  role: Role;
  status: string;
};

export type Employee = {
  id: string;
  status: string;
  /** Display job (Chef, Server). Not used for permission checks. */
  job: { name: string } | null;
};

export type CompanyContext = {
  companyId: string;
  companyName: string;
  operator: Operator | null;
  employee: Employee | null;
  /** Permissions from the operator account only (RBAC). */
  permissions: PermissionCode[];
  /**
   * True when `companyCtx` comes from the short-lived platform-admin impersonation cookie
   * (no operator/employee row required for this company).
   */
  isImpersonatingCompany?: boolean;
};

export type SessionFlags = {
  twoFactorVerified: boolean;
};

export type SessionValidationResult =
  | { session: Session; identity: Identity; companyCtx: CompanyContext | null }
  | { session: null; identity: null; companyCtx: null };
