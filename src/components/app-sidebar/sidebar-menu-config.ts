import { ICONS } from "@/constants/icons";
import { PERMISSIONS } from "@/constants/permissions";
import type { PermissionCode } from "@/types/rbac";
import type { IconSvgElement } from "@hugeicons/react";

export const MENU_GROUPS = ["home", "team", "finance", "settings", "account"] as const;

export type MenuGroupKey = (typeof MENU_GROUPS)[number];

export const MENU_GROUP_LABELS: Record<MenuGroupKey, string> = {
  home: "",
  team: "Team",
  finance: "Finance",
  settings: "Settings",
  account: "Account",
};

export type MenuItem = {
  title: string;
  url: string;
  icon: IconSvgElement;
  group: MenuGroupKey;
  /** If set, user must have this permission to see the item. If undefined, item is visible to all. */
  permission?: PermissionCode;
};

export const MENU_ITEMS: MenuItem[] = [
  // Home
  {
    title: "Home",
    url: "/",
    icon: ICONS.HOME,
    group: "home",
  },
  {
    title: "Sales Reports",
    url: "/sales-reports",
    icon: ICONS.REPORT,
    group: "home",
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    title: "Cash Calculator",
    url: "/cash-calculator",
    icon: ICONS.CALCULATOR,
    group: "home",
  },
  { title: "My Shifts", url: "/my-shifts", icon: ICONS.CALENDAR, group: "home" },
  // Team
  {
    title: "Team",
    url: "/team",
    icon: ICONS.USER_GROUP,
    group: "team",
    permission: PERMISSIONS.TEAM_VIEW,
  },
  {
    title: "Schedules",
    url: "/schedules",
    icon: ICONS.CALENDAR,
    group: "team",
    permission: PERMISSIONS.SCHEDULE_VIEW,
  },
  // Finance
  {
    title: "Hours & Tips",
    url: "/hours&tips",
    icon: ICONS.HOURGLASS,
    group: "finance",
    permission: PERMISSIONS.HOURS_TIPS_VIEW,
  },
  {
    title: "Cashflow",
    url: "/cashflow",
    icon: ICONS.CASHFLOW,
    group: "finance",
    permission: PERMISSIONS.CASHFLOW_VIEW,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: ICONS.EXPENSE,
    group: "finance",
    permission: PERMISSIONS.EXPENSES_VIEW,
  },
  // Settings
  {
    title: "Roles & Permissions",
    url: "/roles",
    icon: ICONS.SHIELD,
    group: "settings",
    permission: PERMISSIONS.ROLES_VIEW,
  },
  {
    title: "Store Settings",
    url: "/store-settings",
    icon: ICONS.STORE_SETTINGS,
    group: "settings",
    permission: PERMISSIONS.STORE_SETTINGS_MANAGE,
  },
  // Account
  { title: "My Profile", url: "__profile__", icon: ICONS.USER_ACCOUNT, group: "account" },
  { title: "Account Settings", url: "/settings", icon: ICONS.ACCOUNT_SETTINGS, group: "account" },
];
