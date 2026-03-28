/**
 * Seed roles and permissions
 *
 * Usage:
 *   npx tsx scripts/seed-roles-and-permissions.ts
 */

import { PrismaClient } from "@serva/database";
const prisma = new PrismaClient();

// Predefined permissions based on app features
const PERMISSIONS = [
  // Reports
  {
    code: "reports.view",
    name: "View Reports",
    description: "Access to sales reports page",
    resource: "reports",
    action: "view",
  },
  {
    code: "reports.create",
    name: "Create Reports",
    description: "Create new sales reports",
    resource: "reports",
    action: "create",
  },
  {
    code: "reports.update",
    name: "Update Reports",
    description: "Update existing sales reports",
    resource: "reports",
    action: "update",
  },
  {
    code: "reports.delete",
    name: "Delete Reports",
    description: "Delete sales reports",
    resource: "reports",
    action: "delete",
  },

  // Team
  {
    code: "team.view",
    name: "View Team",
    description: "View team members list",
    resource: "team",
    action: "view",
  },
  {
    code: "team.assign_roles",
    name: "Assign Roles to Team Members",
    description: "Assign roles to team members",
    resource: "team",
    action: "assign_roles",
  },
  {
    code: "team.manage_access",
    name: "Manage Team Members' Access",
    description: "Manage team members' access (deactivate, verify, reactivate)",
    resource: "team",
    action: "manage_access",
  },

  // Expenses
  {
    code: "expenses.view",
    name: "View Expenses",
    description: "Access to expenses page",
    resource: "expenses",
    action: "view",
  },
  {
    code: "expenses.manage",
    name: "Manage Expenses",
    description: "Manage expenses (create, edit, delete)",
    resource: "expenses",
    action: "manage",
  },

  // Hours & Tips
  {
    code: "hours_tips.view",
    name: "View Hours & Tips",
    description: "Access to hours & tips page",
    resource: "hours_tips",
    action: "view",
  },

  // Cashflow
  {
    code: "cashflow.view",
    name: "View Cashflow",
    description: "Access to cashflow page",
    resource: "cashflow",
    action: "view",
  },

  // Store Settings
  {
    code: "store_settings.manage",
    name: "Manage Store Settings",
    description: "Manage store settings",
    resource: "store_settings",
    action: "manage",
  },

  // Schedule
  {
    code: "schedule.view",
    name: "View Schedule",
    description: "View employee schedule",
    resource: "schedule",
    action: "view",
  },
  {
    code: "schedule.manage",
    name: "Manage Schedule",
    description: "Create and edit schedule entries",
    resource: "schedule",
    action: "manage",
  },

  // Roles management
  {
    code: "roles.view",
    name: "View Roles",
    description: "Access to roles & permissions page",
    resource: "roles",
    action: "view",
  },
  {
    code: "roles.manage",
    name: "Manage Roles",
    description: "Manage roles (create, edit, delete)",
    resource: "roles",
    action: "manage",
  },
] as const;

// Default roles with their permissions
const DEFAULT_ROLES = [
  {
    name: "Admin",
    description: "Restaurant administrator with full access",
    editable: false,
    permissions: [], // All permissions
  },
  {
    name: "Manager",
    description: "Manager with access to reports, team members, and cashflow",
    editable: true,
    permissions: [
      "reports.view",
      "reports.create",
      "reports.update",
      "team.view",
      "team.assign_roles",
      "team.manage_access",
      "schedule.view",
      "schedule.manage",
      "store_settings.manage",
    ],
  },
  {
    name: "Server",
    description: "Server with access to create and view reports",
    editable: true,
    permissions: ["reports.create", "team.view", "schedule.view"],
  },
  {
    name: "Chef",
    description: "Kitchen staff with basic access",
    editable: true,
    permissions: ["team.view", "schedule.view"],
  },
  {
    name: "Team Member",
    description: "Default role for new members, no permissions",
    editable: true,
    permissions: [],
  },
] as const;

async function seedPermissionsAndRoles() {
  console.log("🔐 Seeding permissions and roles...");

  // Create all permissions
  const permissionMap = new Map<string, string>(); // code -> id

  for (const permission of PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
      },
      create: permission,
    });
    permissionMap.set(permission.code, created.id);
    console.log(`  ✓ Permission: ${permission.code}`);
  }

  // Seed roles for every company in the database
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  if (companies.length === 0) {
    console.log("⚠️  No companies found. Create a company first, then re-run the seed.");
    return;
  }

  for (const company of companies) {
    console.log(`\nSeeding roles for company: ${company.name}`);
    await seedRolesForCompany(company.id, permissionMap);
  }

  console.log("\n✅ Permissions and roles seeded successfully!");
}

async function seedRolesForCompany(
  companyId: string,
  permissionMap: Map<string, string>,
) {
  for (const role of DEFAULT_ROLES) {
    const permissionIds = role.permissions
      .map((code) => permissionMap.get(code))
      .filter((id): id is string => id !== undefined);

    const existingRole = await prisma.role.findFirst({
      where: { name: role.name, companyId },
    });

    if (existingRole) {
      await prisma.role.update({
        where: { id: existingRole.id },
        data: {
          description: role.description,
          editable: role.editable,
          permissionIds: permissionIds,
        },
      });
    } else {
      await prisma.role.create({
        data: {
          companyId,
          name: role.name,
          description: role.description,
          editable: role.editable,
          permissionIds: permissionIds,
        },
      });
    }
    console.log(`  ✓ Role: ${role.name} (${permissionIds.length} permissions)`);
  }
}

async function main() {
  await seedPermissionsAndRoles();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
