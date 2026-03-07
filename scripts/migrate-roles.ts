/**
 * Migration script to convert existing users from legacy string-based role
 * to the new Role relation system.
 *
 * Run with: npx tsx scripts/migrate-roles.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLE_NAME_MAP: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  server: "Server",
  chef: "Chef",
  unassigned: "Team Member",
  "unassigned role": "Team Member",
};

async function migrateUserRoles() {
  console.log("Starting user role migration...\n");

  // First, ensure roles exist by checking
  const existingRoles = await prisma.role.findMany({
    select: { id: true, name: true },
  });

  if (existingRoles.length === 0) {
    console.error("Error: No roles found in database. Please run the seed script first:");
    console.error("  npx prisma db seed\n");
    process.exit(1);
  }

  console.log("Available roles:");
  for (const role of existingRoles) {
    console.log(`  - ${role.name} (${role.id})`);
  }
  console.log("");

  // Create a map of role name (lowercase) to role ID
  const roleNameToId = new Map<string, string>();
  for (const role of existingRoles) {
    roleNameToId.set(role.name.toLowerCase(), role.id);
  }

  // Get all users that don't have a roleId yet
  // We need to use raw query to access the legacy 'role' field
  const usersWithLegacyRole = await prisma.$runCommandRaw({
    find: "User",
    filter: {
      roleId: { $exists: false },
      role: { $exists: true },
    },
  });

  const users =
    (
      usersWithLegacyRole as {
        cursor: {
          firstBatch: Array<{
            _id: { $oid: string };
            name: string;
            email: string;
            role: string;
          }>;
        };
      }
    ).cursor?.firstBatch || [];

  if (users.length === 0) {
    console.log(
      "No users with legacy role field found. Migration may have already been completed.\n",
    );

    // Also check users without any role
    const usersWithoutRole = await prisma.user.findMany({
      where: { roleId: null },
      select: { id: true, name: true, email: true },
    });

    if (usersWithoutRole.length > 0) {
      console.log(`Found ${usersWithoutRole.length} user(s) without a role assigned:`);
      for (const user of usersWithoutRole) {
        console.log(`  - ${user.name} (${user.email})`);
      }
      console.log("\nYou may want to manually assign roles to these users.\n");
    }

    return;
  }

  console.log(`Found ${users.length} user(s) with legacy role field:\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    const userId = user._id.$oid;
    const legacyRole = user.role?.toLowerCase()?.trim();
    const userName = user.name;
    const userEmail = user.email;

    // Map legacy role name to new role name
    const mappedRoleName = ROLE_NAME_MAP[legacyRole] || legacyRole;
    const roleId = roleNameToId.get(mappedRoleName?.toLowerCase());

    if (!roleId) {
      console.log(`  ⚠ Skipping ${userName} (${userEmail}): Unknown role "${legacyRole}"`);
      skippedCount++;
      continue;
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { roleId },
      });
      console.log(`  ✓ Migrated ${userName} (${userEmail}): "${legacyRole}" → "${mappedRoleName}"`);
      migratedCount++;
    } catch (error) {
      console.error(`  ✗ Failed to migrate ${userName} (${userEmail}):`, error);
      skippedCount++;
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`  Migrated: ${migratedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
}

async function removeLegacyRoleField() {
  console.log("Removing legacy 'role' field from users...");
  await prisma.$runCommandRaw({
    update: "User",
    updates: [{ q: { role: { $exists: true } }, u: { $unset: { role: "" } }, multi: true }],
  });
  console.log("Done!\n");
}

async function main() {
  try {
    // await migrateUserRoles();
    await removeLegacyRoleField();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
