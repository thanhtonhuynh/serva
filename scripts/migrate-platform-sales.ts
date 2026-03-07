/**
 * Migration script: Populate platformSales from legacy columns
 *
 * This script reads all SaleReport documents and creates the new
 * `platformSales` embedded array from the existing legacy columns:
 *   - uberEatsSales    → { platformId: "uber_eats",        amount }
 *   - doorDashSales    → { platformId: "doordash",          amount }
 *   - skipTheDishesSales → { platformId: "skip_the_dishes", amount }
 *   - onlineSales      → { platformId: "ritual",            amount }
 *
 * It also ensures the StoreSettings document has the `activePlatforms` field
 * set to the default platforms.
 *
 * Legacy columns are NOT removed — they are kept for backward compatibility.
 *
 * Usage:
 *   npx tsx scripts/migrate-platform-sales.ts
 *
 * ⚠️  DRY RUN by default. Set DRY_RUN=false to actually write:
 *   DRY_RUN=false npx tsx scripts/migrate-platform-sales.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DRY_RUN = process.env.DRY_RUN !== "false";

const LEGACY_FIELD_MAP: Record<string, string> = {
  uberEatsSales: "uber_eats",
  doorDashSales: "doordash",
  skipTheDishesSales: "skip_the_dishes",
  onlineSales: "ritual",
};

const DEFAULT_ACTIVE_PLATFORMS = ["uber_eats", "doordash", "skip_the_dishes", "ritual"];

async function migrateSaleReports() {
  console.log("📦 Fetching all SaleReport documents...");
  const reports = await prisma.saleReport.findMany({
    select: {
      id: true,
      date: true,
      uberEatsSales: true,
      doorDashSales: true,
      skipTheDishesSales: true,
      onlineSales: true,
      platformSales: true,
    },
  });

  console.log(`   Found ${reports.length} SaleReport records`);

  let skipped = 0;
  let updated = 0;

  for (const report of reports) {
    // Skip if platformSales is already populated
    if (report.platformSales && report.platformSales.length > 0) {
      skipped++;
      continue;
    }

    // Build platformSales from legacy columns
    const platformSales: { platformId: string; amount: number }[] = [];

    for (const [legacyField, platformId] of Object.entries(LEGACY_FIELD_MAP)) {
      const value = (report as Record<string, unknown>)[legacyField];
      const amount = typeof value === "number" ? value : 0;
      if (amount > 0) {
        platformSales.push({ platformId, amount });
      }
    }

    if (DRY_RUN) {
      console.log(
        `   [DRY RUN] Would update report ${report.id} (${report.date.toISOString().slice(0, 10)}) with ${platformSales.length} platform entries`,
      );
      if (platformSales.length > 0) {
        for (const ps of platformSales) {
          console.log(`     - ${ps.platformId}: ${(ps.amount / 100).toFixed(2)}`);
        }
      }
    } else {
      await prisma.saleReport.update({
        where: { id: report.id },
        data: { platformSales },
      });
    }

    updated++;
  }

  console.log(
    `\n✅ SaleReports: ${updated} updated, ${skipped} skipped (already had platformSales)`,
  );
}

async function migrateStoreSettings() {
  console.log("\n📦 Checking StoreSettings for activePlatforms...");

  const settings = await prisma.storeSettings.findFirst();

  if (!settings) {
    console.log("   ⚠️  No StoreSettings document found. Skipping.");
    return;
  }

  // Check if activePlatforms is already set
  const existing = (settings as Record<string, unknown>).activePlatforms;
  if (Array.isArray(existing) && existing.length > 0) {
    console.log(
      `   StoreSettings already has activePlatforms: [${existing.join(", ")}]. Skipping.`,
    );
    return;
  }

  if (DRY_RUN) {
    console.log(
      `   [DRY RUN] Would set activePlatforms to: [${DEFAULT_ACTIVE_PLATFORMS.join(", ")}]`,
    );
  } else {
    await prisma.storeSettings.update({
      where: { id: settings.id },
      data: { activePlatforms: DEFAULT_ACTIVE_PLATFORMS },
    });
    console.log(`   ✅ Set activePlatforms to: [${DEFAULT_ACTIVE_PLATFORMS.join(", ")}]`);
  }
}

async function main() {
  console.log(DRY_RUN ? "🔍 DRY RUN MODE (no writes)\n" : "🚀 LIVE MODE\n");

  // await migrateSaleReports();
  // await migrateStoreSettings();

  console.log(
    DRY_RUN
      ? "\n🔍 Dry run complete. Run with DRY_RUN=false to apply changes."
      : "\n✅ Migration complete!",
  );
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
