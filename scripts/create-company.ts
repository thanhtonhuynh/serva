/**
 * Create a new Company (and optionally CompanySettings).
 *
 * Usage:
 *   npx tsx scripts/create-company.ts "My Company" my-company
 *   npx tsx scripts/create-company.ts "My Company" my-company --with-settings
 *   COMPANY_NAME="My Company" COMPANY_SLUG=my-company npx tsx scripts/create-company.ts
 *
 * Options:
 *   --with-settings   Also create CompanySettings (startCash: 0, default activePlatforms)
 */

import { PrismaClient } from "@serva/database";

const prisma = new PrismaClient();

const DEFAULT_ACTIVE_PLATFORMS = [
  "uber_eats",
  "doordash",
  "skip_the_dishes",
  "ritual",
] as const;

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function main() {
  let name = process.env.COMPANY_NAME;
  let slug = process.env.COMPANY_SLUG;
  const withSettings = process.argv.includes("--with-settings");
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));

  if (args.length >= 1) name = args[0];
  if (args.length >= 2) slug = args[1];

  if (!name?.trim()) {
    console.error("Usage: npx tsx scripts/create-company.ts <name> [slug] [--with-settings]");
    console.error("   or: COMPANY_NAME=... COMPANY_SLUG=... npx tsx scripts/create-company.ts [--with-settings]");
    process.exit(1);
  }

  const finalSlug = (slug || slugFromName(name)).toLowerCase().trim();
  if (!finalSlug) {
    console.error("Could not derive a valid slug. Provide one explicitly: create-company.ts \"My Company\" my-company");
    process.exit(1);
  }

  const existing = await prisma.company.findUnique({ where: { slug: finalSlug } });
  if (existing) {
    console.error(`Company with slug "${finalSlug}" already exists: ${existing.name} (${existing.id})`);
    process.exit(1);
  }

  const company = await prisma.company.create({
    data: { name: name.trim(), slug: finalSlug },
  });
  console.log(`Created company: ${company.name} (${company.id}) slug=${company.slug}`);

  if (withSettings) {
    await prisma.companySettings.create({
      data: {
        companyId: company.id,
        startCash: 0,
        activePlatforms: [...DEFAULT_ACTIVE_PLATFORMS],
      },
    });
    console.log("Created CompanySettings (startCash: 0, default activePlatforms).");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
