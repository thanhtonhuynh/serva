/**
 * Script to add a platform super admin user to the database.
 *
 * Run with: npx ts-node scripts/add-admin-user.ts
 * Or: npx tsx scripts/add-admin-user.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userId = "-";

async function addAdminUser() {
  console.log("Starting admin user addition...\n");

  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, adminUser: true },
  });

  if (!user) {
    console.error(`User ${userId} not found`);
    process.exit(1);
  }

  if (user.adminUser) {
    console.error(`User ${user.name} already has an admin user record`);
    process.exit(1);
  }

  // Create a new admin user
  await prisma.adminUser.create({
    data: { userId },
  });

  console.log(`Admin user added successfully for ${user.name}`);
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
