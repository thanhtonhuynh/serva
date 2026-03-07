/**
 * Migration script: Convert expense dates to UTC midnight
 *
 * Expense dates are stored as one document per calendar day. This script
 * converts existing dates to true UTC midnight (e.g. 2026-02-07T00:00:00.000Z),
 * making the date a timezone-agnostic calendar date identifier.
 *
 * For each expense, the stored date is interpreted in America/Vancouver to get
 * the calendar day (YYYY-MM-DD), then saved as that day at UTC midnight.
 *
 * The script is idempotent -- expenses already at UTC midnight are skipped.
 *
 * Usage:
 *   npx tsx scripts/migrate-expense-dates-to-utc-midnight.ts
 *
 * DRY RUN by default. Set DRY_RUN=false to actually write:
 *   DRY_RUN=false npx tsx scripts/migrate-expense-dates-to-utc-midnight.ts
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

  console.log("Fetching all Expense documents...");
  const expenses = await prisma.expense.findMany({
    select: { id: true, date: true },
    orderBy: { date: "asc" },
  });

  console.log(`Found ${expenses.length} expenses\n`);

  let skipped = 0;
  let updated = 0;

  for (const expense of expenses) {
    if (isUTCMidnight(expense.date)) {
      skipped++;
      continue;
    }

    const newDate = toUTCMidnight(expense.date);

    if (DRY_RUN) {
      console.log(
        `[DRY RUN] ${expense.id}: ${expense.date.toISOString()} -> ${newDate.toISOString()}`,
      );
    } else {
      await prisma.expense.update({
        where: { id: expense.id },
        data: { date: newDate },
      });
      console.log(
        `Updated ${expense.id}: ${expense.date.toISOString()} -> ${newDate.toISOString()}`,
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
