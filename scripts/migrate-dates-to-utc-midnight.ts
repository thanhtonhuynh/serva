/**
 * Migration script: Convert report dates to UTC midnight
 *
 * Previously, report dates were stored as start-of-day in Vancouver time
 * converted to UTC, e.g. 2026-02-07 Vancouver = 2026-02-07T08:00:00Z (PST)
 * or 2026-02-07T07:00:00Z (PDT).
 *
 * This script converts them to true UTC midnight: 2026-02-07T00:00:00.000Z,
 * making the date a timezone-agnostic calendar date identifier.
 *
 * The script is idempotent -- reports already at UTC midnight are skipped.
 *
 * Usage:
 *   npx tsx scripts/migrate-dates-to-utc-midnight.ts
 *
 * DRY RUN by default. Set DRY_RUN=false to actually write:
 *   DRY_RUN=false npx tsx scripts/migrate-dates-to-utc-midnight.ts
 */

import { PrismaClient } from "@prisma/client";
import moment from "moment-timezone";

const prisma = new PrismaClient();

const DRY_RUN = process.env.DRY_RUN !== "false";
const TIMEZONE = "America/Vancouver";

function isUTCMidnight(date: Date): boolean {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

function toUTCMidnight(date: Date): Date {
  const dateStr = moment(date).tz(TIMEZONE).format("YYYY-MM-DD");
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

async function main() {
  console.log(DRY_RUN ? "DRY RUN MODE (no writes)\n" : "LIVE MODE\n");

  console.log("Fetching all SaleReport documents...");
  const reports = await prisma.saleReport.findMany({
    select: { id: true, date: true },
    orderBy: { date: "asc" },
  });

  console.log(`Found ${reports.length} reports\n`);

  let skipped = 0;
  let updated = 0;

  for (const report of reports) {
    if (isUTCMidnight(report.date)) {
      skipped++;
      continue;
    }

    const newDate = toUTCMidnight(report.date);

    if (DRY_RUN) {
      console.log(
        `[DRY RUN] ${report.id}: ${report.date.toISOString()} -> ${newDate.toISOString()}`,
      );
    } else {
      await prisma.saleReport.update({
        where: { id: report.id },
        data: { date: newDate },
      });
      console.log(
        `Updated ${report.id}: ${report.date.toISOString()} -> ${newDate.toISOString()}`,
      );
    }

    updated++;
  }

  console.log(
    `\nDone: ${updated} updated, ${skipped} skipped (already at UTC midnight)`,
  );

  if (DRY_RUN) {
    console.log("\nDry run complete. Run with DRY_RUN=false to apply changes.");
  }
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
