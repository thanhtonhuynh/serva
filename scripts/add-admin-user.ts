/**
 * Script to add a platform super admin user to the database.
 *
 * Run with: npx ts-node scripts/add-admin-user.ts
 * Or: npx tsx scripts/add-admin-user.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const identityId = "-";

async function addAdminUser() {
  console.log("Starting admin user addition...\n");

  // Check if the user exists
  const identity = await prisma.identity.findUnique({
    where: { id: identityId },
    select: { id: true, name: true, adminUser: true },
  });

  if (!identity) {
    console.error(`User ${identityId} not found`);
    process.exit(1);
  }

  if (identity.adminUser) {
    console.error(`User ${identity.name} already has an admin user record`);
    process.exit(1);
  }

  // Create a new admin user
  await prisma.adminUser.create({
    data: { identityId },
  });

  console.log(`Admin user added successfully for ${identity.name}`);
}

async function main() {
  try {
    // await addAdminUser();
  } catch (error) {
    console.error("Failed to add admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
