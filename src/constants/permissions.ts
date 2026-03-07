/**
 * Permissions constants for the app.
 */
export const PERMISSIONS = {
  // Admin
  ADMIN_ACCESS: "admin.access",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_CREATE: "reports.create",
  REPORTS_UPDATE: "reports.update",
  REPORTS_DELETE: "reports.delete",

  // Team
  TEAM_VIEW: "team.view",
  TEAM_ASSIGN_ROLES: "team.assign_roles",
  TEAM_MANAGE_ACCESS: "team.manage_access",

  // Expenses
  EXPENSES_VIEW: "expenses.view",
  EXPENSES_MANAGE: "expenses.manage",

  // Hours & Tips
  HOURS_TIPS_VIEW: "hours_tips.view",

  // Cashflow
  CASHFLOW_VIEW: "cashflow.view",

  // Store Settings
  STORE_SETTINGS_MANAGE: "store_settings.manage",

  // Roles
  ROLES_VIEW: "roles.view",
  ROLES_MANAGE: "roles.manage",

  // Schedule
  SCHEDULE_VIEW: "schedule.view",
  SCHEDULE_MANAGE: "schedule.manage",
} as const;
